const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Topic = require('../models/Topic');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const gamificationService = require('../services/gamificationService');
const { creditReward } = require('../utils/ecoPointsManager');
const rewardValues = require('../constants/rewardValues');
const { checkAndAwardBadges } = require('../utils/badgeEngine');
const { checkLevelUp } = require('../utils/levelEngine');
const { incrementMissionProgress } = require('./missionController');

// @desc    Get all quizzes with filtering and pagination
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      gradeLevel,
      topic,
      page = 1,
      limit = 12,
      sort = '-publishedAt',
      search,
      featured
    } = req.query;

    // Build query
    let query = { status: 'published' };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = topic;
    if (gradeLevel) query.gradeLevel = { $in: [gradeLevel] };
    if (featured === 'true') query.featured = true;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const quizzes = await Quiz.find(query)
      .populate('topic', 'title slug category')
      .populate('author', 'name profile.avatar')
      .select('-attempts -analytics.questionAnalytics') // Exclude sensitive data
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Quiz.countDocuments(query);

    res.status(200).json({
      success: true,
      data: quizzes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quizzes'
    });
  }
};

// @desc    Get single quiz by slug
// @route   GET /api/quizzes/:slug
// @access  Public
const getQuiz = async (req, res) => {
  try {
    const lookupValue = req.params.slug;
    const query = {
      status: 'published',
      $or: [{ slug: lookupValue }]
    };

    if (mongoose.Types.ObjectId.isValid(lookupValue)) {
      query.$or.push({ _id: lookupValue });
    }

    const quiz = await Quiz.findOne(query)
      .populate('topic', 'title slug description category')
      .populate('author', 'name profile.avatar profile.title')
      .select('-attempts.answers -analytics.questionAnalytics'); // Hide answers and detailed analytics

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // If authenticated, get user's attempts
    let userAttempts = [];
    if (req.user) {
      userAttempts = quiz.attempts.filter(attempt =>
        attempt.user.toString() === req.user.id
      );
    }

    // Remove attempts from response for security
    const quizData = quiz.toObject();
    delete quizData.attempts;

    res.status(200).json({
      success: true,
      data: {
        ...quizData,
        userAttempts: userAttempts.map(attempt => ({
          _id: attempt._id,
          attemptNumber: attempt.attemptNumber,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          score: attempt.score,
          timeSpent: attempt.timeSpent,
          status: attempt.status,
          certificateIssued: attempt.certificateIssued
        }))
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz'
    });
  }
};

// @desc    Start quiz attempt
// @route   POST /api/quizzes/:id/start
// @access  Private
const startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'Quiz is not available'
      });
    }

    // Check if user has exceeded max attempts
    const userAttempts = quiz.attempts.filter(attempt =>
      attempt.user.toString() === req.user.id
    );

    if (userAttempts.length >= quiz.scoring.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts exceeded'
      });
    }

    // Prevent duplicate quiz attempts for points within last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempt = userAttempts.find(attempt =>
      attempt.startedAt > twentyFourHoursAgo && attempt.status === 'completed'
    );
    if (recentAttempt) {
      return res.status(429).json({
        success: false,
        message: 'You have already attempted this quiz in the last 24 hours. Please wait before trying again.'
      });
    }

    // Check if user already has an in-progress attempt
    const inProgressAttempt = userAttempts.find(attempt =>
      attempt.status === 'in-progress'
    );

    if (inProgressAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an in-progress attempt',
        attemptId: inProgressAttempt._id
      });
    }

    const attempt = await quiz.startAttempt(req.user.id);

    // Return quiz questions without correct answers
    const questionsForAttempt = quiz.questions.map(question => ({
      _id: question._id,
      questionNumber: question.questionNumber,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options.map(option => ({
        _id: option._id,
        optionText: option.optionText
      })),
      matchPairs: question.matchPairs ? question.matchPairs.map(pair => ({
        left: pair.left,
        right: pair.right
      })) : [],
      points: question.points,
      timeLimit: question.timeLimit,
      hint: question.hint,
      image: question.image,
      difficulty: question.difficulty
    }));

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        questions: quiz.features.shuffleQuestions
          ? shuffleArray(questionsForAttempt)
          : questionsForAttempt,
        timeLimit: quiz.timeLimit,
        features: quiz.features
      }
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while starting quiz attempt'
    });
  }
};

// @desc    Submit answer for quiz question
// @route   POST /api/quizzes/:id/submit-answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, answer, timeSpent, hintsUsed = 0 } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const attempt = quiz.attempts.id(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this attempt'
      });
    }

    if (attempt.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'This attempt is no longer active'
      });
    }

    await quiz.submitAnswer(attemptId, questionId, answer);

    // Find the question to provide immediate feedback if enabled
    const question = quiz.questions.id(questionId);
    let feedback = null;

    if (quiz.features.instantFeedback && question) {
      const submittedAnswer = attempt.answers.find(ans =>
        ans.questionId.toString() === questionId.toString()
      );

      if (submittedAnswer) {
        if (question.questionType === 'multiple-choice') {
          const selectedOption = question.options.id(answer);
          feedback = {
            isCorrect: submittedAnswer.isCorrect,
            explanation: selectedOption ? selectedOption.explanation : question.explanation,
            correctAnswer: question.options.find(opt => opt.isCorrect)?.optionText
          };
        } else {
          feedback = {
            isCorrect: submittedAnswer.isCorrect,
            explanation: question.explanation,
            correctAnswer: question.correctAnswer
          };
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting answer'
    });
  }
};

// @desc    Complete quiz attempt
// @route   POST /api/quizzes/:id/complete
// @access  Private
const completeQuizAttempt = async (req, res) => {
  try {
    const { attemptId, totalTimeSpent } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const attempt = quiz.attempts.id(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this attempt'
      });
    }

    await quiz.completeAttempt(attemptId, totalTimeSpent);

    // Calculate EcoPoints to award
    const passed = attempt.score.percentage >= quiz.scoring.passingScore;
    let ecoPointsEarned = 0;

    if (passed) {
      ecoPointsEarned = quiz.ecoPointsReward;

      // Bonus points
      if (attempt.score.percentage === 100) {
        ecoPointsEarned += quiz.bonusPoints.perfectScore;
      }

      if (attempt.attemptNumber === 1) {
        ecoPointsEarned += quiz.bonusPoints.firstAttempt;
      }

      await creditReward({
        userId: req.user.id,
        points: rewardValues.QUIZ_COMPLETED,
        reason: `Quiz completed: ${quiz.title}`,
        idempotencyKey: `${req.user.id}:${quiz._id}:${attemptId}:QUIZ_COMPLETED`,
        sourceId: quiz._id,
        sourceModel: 'Quiz',
        action: 'EP_CREDIT'
      });
      await checkLevelUp(req.user.id);
      await checkLevelUp(req.user.id);

      const gamificationService = require('../services/gamificationService');
      const newBadges = await gamificationService.evaluateBadgesForUser(req.user.id);
      if (newBadges?.length > 0) {
        console.log(`[Badges] User ${req.user.id} unlocked: ${newBadges.map(b => b.name).join(', ')}`);
      }

      // Non-blocking mission progress increment
      incrementMissionProgress(req.user.id, 'complete_quiz')
        .catch(err => console.error('Mission progress error:', err));

      // Mark certificate as issued
      attempt.certificateIssued = true;
      await quiz.save();

      // Store gamification results for response
      attempt.gamificationRewards = {
        pointsAwarded: rewardValues.QUIZ_COMPLETED,
        totalPoints: 0,
        levelUp: false,
        newLevel: 0,
        newBadges: []
      };
    }

    // Prepare results with correct answers for review
    const results = {
      score: attempt.score,
      timeSpent: attempt.timeSpent,
      passed,
      ecoPointsEarned,
      certificateIssued: attempt.certificateIssued,
      gamificationRewards: attempt.gamificationRewards || null,
      questions: quiz.questions.map(question => {
        const userAnswer = attempt.answers.find(ans =>
          ans.questionId.toString() === question._id.toString()
        );

        return {
          _id: question._id,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswer: question.correctAnswer,
          matchPairs: question.matchPairs,
          explanation: question.explanation,
          userAnswer: userAnswer ? {
            selectedAnswer: userAnswer.selectedAnswer,
            isCorrect: userAnswer.isCorrect,
            pointsEarned: userAnswer.pointsEarned,
            timeSpent: userAnswer.timeSpent
          } : null
        };
      })
    };

    res.status(200).json({
      success: true,
      message: passed ? 'Quiz completed successfully!' : 'Quiz completed. Keep practicing!',
      data: results
    });
  } catch (error) {
    console.error('Complete quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while completing quiz attempt'
    });
  }
};

// @desc    Get user's quiz attempts
// @route   GET /api/quizzes/my-attempts
// @access  Private
const getMyQuizAttempts = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      'attempts.user': req.user.id
    })
      .select('title slug category difficulty attempts')
      .populate('topic', 'title slug');

    const attempts = [];
    quizzes.forEach(quiz => {
      const userAttempts = quiz.attempts.filter(attempt =>
        attempt.user.toString() === req.user.id
      );

      userAttempts.forEach(attempt => {
        attempts.push({
          quiz: {
            _id: quiz._id,
            title: quiz.title,
            slug: quiz.slug,
            category: quiz.category,
            difficulty: quiz.difficulty,
            topic: quiz.topic
          },
          attempt: {
            _id: attempt._id,
            attemptNumber: attempt.attemptNumber,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
            score: attempt.score,
            timeSpent: attempt.timeSpent,
            status: attempt.status,
            certificateIssued: attempt.certificateIssued
          }
        });
      });
    });

    // Sort by most recent
    attempts.sort((a, b) => new Date(b.attempt.startedAt) - new Date(a.attempt.startedAt));

    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Get my quiz attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your quiz attempts'
    });
  }
};

// @desc    Get user's quiz statistics
// @route   GET /api/quizzes/my-stats
// @access  Private
const getMyStats = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      'attempts.user': req.user.id
    }).select('attempts');

    let totalAttempts = 0;
    let completedQuizzes = 0;
    let totalScore = 0;
    let completedAttemptsCount = 0;
    const completedQuizIds = new Set();

    quizzes.forEach(quiz => {
      const userAttempts = quiz.attempts.filter(
        attempt => attempt.user.toString() === req.user.id
      );

      totalAttempts += userAttempts.length;

      const passedAttempts = userAttempts.filter(
        attempt => attempt.status === 'completed' && attempt.score?.percentage >= quiz.scoring?.passingScore
      );

      if (passedAttempts.length > 0) {
        completedQuizIds.add(quiz._id.toString());
      }

      userAttempts.forEach(attempt => {
        if (attempt.status === 'completed' && attempt.score?.percentage) {
          totalScore += attempt.score.percentage;
          completedAttemptsCount++;
        }
      });
    });

    const averageScore = completedAttemptsCount > 0
      ? Math.round(totalScore / completedAttemptsCount)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalQuizzes: await Quiz.countDocuments({ status: 'published' }),
        totalAttempts,
        averageScore,
        completedQuizzes: completedQuizIds.size
      }
    });

  } catch (error) {
    console.error('Get my stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your quiz stats'
    });
  }
};

// @desc    Get featured quizzes
// @route   GET /api/quizzes/featured
// @access  Public
const getFeaturedQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      status: 'published',
      featured: true
    })
      .populate('topic', 'title slug category')
      .populate('author', 'name profile.avatar')
      .select('-attempts -analytics.questionAnalytics')
      .sort('-publishedAt')
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get featured quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured quizzes'
    });
  }
};

// @desc    Get popular quizzes
// @route   GET /api/quizzes/popular
// @access  Public
const getPopularQuizzes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const quizzes = await Quiz.getPopularQuizzes(limit);

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get popular quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular quizzes'
    });
  }
};

// @desc    Get quizzes by topic
// @route   GET /api/quizzes/topic/:topicId
// @access  Public
const getQuizzesByTopic = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      topic: req.params.topicId,
      status: 'published'
    })
      .populate('author', 'name profile.avatar')
      .select('-attempts -analytics.questionAnalytics')
      .sort('-publishedAt');

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get quizzes by topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quizzes by topic'
    });
  }
};

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private (Teachers/Admins)
const createQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    req.body.author = req.user.id;
    const quiz = await Quiz.create(req.body);

    await quiz.populate('topic', 'title slug category');
    await quiz.populate('author', 'name profile.avatar');

    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating quiz'
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Author/Admin)
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check ownership or admin
    if (quiz.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quiz'
      });
    }

    req.body.lastModifiedBy = req.user.id;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('topic', 'title slug category')
      .populate('author', 'name profile.avatar');

    res.status(200).json({
      success: true,
      data: updatedQuiz,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating quiz'
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Author/Admin)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check ownership or admin
    if (quiz.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting quiz'
    });
  }
};

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

module.exports = {
  getQuizzes,
  getQuiz,
  startQuizAttempt,
  submitAnswer,
  completeQuizAttempt,
  getMyQuizAttempts,
  getMyStats,
  getFeaturedQuizzes,
  getPopularQuizzes,
  getQuizzesByTopic,
  createQuiz,
  updateQuiz,
  deleteQuiz
};