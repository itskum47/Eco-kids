const Experiment = require('../models/Experiment');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const { validationResult } = require('express-validator');
const { calculateImpact } = require('../utils/impactCalculator');

// @desc    Get all experiments with filtering and pagination
// @route   GET /api/experiments
// @access  Public
const getExperiments = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      gradeLevel,
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
    const experiments = await Experiment.find(query)
      .populate('author', 'name profile.avatar')
      .populate('relatedTopics', 'title slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Experiment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: experiments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get experiments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching experiments'
    });
  }
};

// @desc    Get single experiment by slug
// @route   GET /api/experiments/:slug
// @access  Public
const getExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findOne({ 
      slug: req.params.slug,
      status: 'published'
    })
    .populate('author', 'name profile.avatar profile.title')
    .populate('relatedTopics', 'title slug description')
    .populate('relatedExperiments', 'title slug difficulty estimatedTime multimedia.featuredImage');

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }

    // Increment views if not the author
    if (!req.user || req.user.id !== experiment.author._id.toString()) {
      await experiment.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: experiment
    });
  } catch (error) {
    console.error('Get experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching experiment'
    });
  }
};

// @desc    Create new experiment
// @route   POST /api/experiments
// @access  Private (Teachers/Admins)
const createExperiment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Add author to the experiment
    req.body.author = req.user.id;
    
    // Handle image uploads if present
    if (req.files) {
      const uploadPromises = [];
      
      if (req.files.featuredImage) {
        uploadPromises.push(
          cloudinary.uploader.upload(req.files.featuredImage[0].path, {
            folder: 'ecokids/experiments/featured'
          })
        );
      }
      
      if (req.files.instructionImages) {
        req.files.instructionImages.forEach(file => {
          uploadPromises.push(
            cloudinary.uploader.upload(file.path, {
              folder: 'ecokids/experiments/instructions'
            })
          );
        });
      }

      const uploadResults = await Promise.all(uploadPromises);
      
      let imageIndex = 0;
      if (req.files.featuredImage) {
        req.body.multimedia = req.body.multimedia || {};
        req.body.multimedia.featuredImage = uploadResults[imageIndex].secure_url;
        imageIndex++;
      }
      
      if (req.files.instructionImages) {
        req.body.multimedia = req.body.multimedia || {};
        req.body.multimedia.instructionImages = uploadResults.slice(imageIndex).map(result => result.secure_url);
      }
    }

    const experiment = await Experiment.create(req.body);
    
    // Populate author for response
    await experiment.populate('author', 'name profile.avatar');

    res.status(201).json({
      success: true,
      data: experiment,
      message: 'Experiment created successfully'
    });
  } catch (error) {
    console.error('Create experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating experiment'
    });
  }
};

// @desc    Update experiment
// @route   PUT /api/experiments/:id
// @access  Private (Author/Admin)
const updateExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }

    // Check ownership or admin
    if (experiment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this experiment'
      });
    }

    req.body.lastModifiedBy = req.user.id;

    const updatedExperiment = await Experiment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name profile.avatar');

    res.status(200).json({
      success: true,
      data: updatedExperiment,
      message: 'Experiment updated successfully'
    });
  } catch (error) {
    console.error('Update experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating experiment'
    });
  }
};

// @desc    Delete experiment
// @route   DELETE /api/experiments/:id
// @access  Private (Author/Admin)
const deleteExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }

    // Check ownership or admin
    if (experiment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this experiment'
      });
    }

    await experiment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Experiment deleted successfully'
    });
  } catch (error) {
    console.error('Delete experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting experiment'
    });
  }
};

// @desc    Submit experiment result
// @route   POST /api/experiments/:id/submit
// @access  Private (Students)
const submitExperimentResult = async (req, res) => {
  try {
    const { observations, results, learnings, rating, feedback } = req.body;

    const experiment = await Experiment.findById(req.params.id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }

    // Check if user already submitted
    const existingSubmission = experiment.submissions.find(
      sub => sub.user.toString() === req.user.id
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted results for this experiment'
      });
    }

    // Handle photo uploads
    let photos = [];
    if (req.files && req.files.photos) {
      const uploadPromises = req.files.photos.map(file =>
        cloudinary.uploader.upload(file.path, {
          folder: 'ecokids/experiments/submissions'
        })
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      photos = uploadResults.map(result => result.secure_url);
    }

    // Record attempt
    await experiment.recordAttempt();

    const normalizedObservations = Array.isArray(observations)
      ? observations
      : observations
        ? [{ question: 'Observations', answer: observations }]
        : [];

    // Submit the result (NO POINTS YET - Only on approval)
    const submissionData = {
      observations: normalizedObservations,
      results,
      learnings,
      rating: rating || 5,
      feedback,
      photos,
      status: 'submitted',
      submittedAt: new Date()
    };

    await experiment.submitResult(req.user.id, submissionData);

    // Add rating to experiment average
    if (rating) {
      await experiment.addRating(rating);
    }

    res.status(201).json({
      success: true,
      message: 'Experiment result submitted successfully. Awaiting admin approval.',
      pointsEarned: 0
    });
  } catch (error) {
    console.error('Submit experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting experiment result'
    });
  }
};

// @desc    Get experiment submissions (for teachers/admins)
// @route   GET /api/experiments/:id/submissions
// @access  Private (Teachers/Admins)
const getExperimentSubmissions = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id)
      .populate('submissions.user', 'name profile.avatar profile.school profile.grade');

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }

    // Check if user can view submissions
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view submissions'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        experimentTitle: experiment.title,
        submissions: experiment.submissions
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
};

// @desc    Review experiment submission
// @route   PUT /api/experiments/:id/submissions/:submissionId
// @access  Private (Teachers/Admins)
const reviewSubmission = async (req, res) => {
  try {
    const { status, teacherFeedback, points } = req.body;

    const experiment = await Experiment.findById(req.params.id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }

    const submission = experiment.submissions.id(req.params.submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update submission
    const previousStatus = submission.status;
    submission.status = status;
    submission.teacherFeedback = teacherFeedback;
    submission.reviewedAt = new Date();
    
    // Set points - default to experiment reward if not specified
    const awardedPoints = points !== undefined ? points : experiment.ecoPointsReward;
    submission.points = awardedPoints;

    await experiment.save();

    // Award or revoke points based on approval status
    if (status === 'approved' && previousStatus !== 'approved') {
      // Newly approved - award points AND track environmental impact
      const user = await User.findByIdAndUpdate(submission.user, {
        $inc: { 
          'gamification.ecoPoints': awardedPoints,
          'gamification.experimentsCompleted': 1
        }
      }, { new: true });

      // Calculate environmental impact based on experiment category
      const impactData = {};
      const impact = calculateImpact(experiment.category, impactData);
      console.log('[Impact triggered]', experiment.category, impact);
      
      // Update user's environmental impact
      await user.updateEnvironmentalImpact(impact);
    } else if (status !== 'approved' && previousStatus === 'approved') {
      // Revoke points if previously approved
      const user = await User.findByIdAndUpdate(submission.user, {
        $inc: { 
          'gamification.ecoPoints': -awardedPoints,
          'gamification.experimentsCompleted': -1
        }
      }, { new: true });

      // Revoke environmental impact
      const impactData = {};
      const impact = calculateImpact(experiment.category, impactData);
      
      // Negate the impact values
      const negativeImpact = {
        treesPlanted: -impact.treesPlanted,
        co2Prevented: -impact.co2Prevented,
        waterSaved: -impact.waterSaved,
        plasticReduced: -impact.plasticReduced,
        energySaved: -impact.energySaved,
        activitiesCompleted: -impact.activitiesCompleted
      };
      
      await user.updateEnvironmentalImpact(negativeImpact);
    }

    res.status(200).json({
      success: true,
      message: 'Submission reviewed successfully',
      pointsAwarded: status === 'approved' ? awardedPoints : 0
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing submission'
    });
  }
};

// @desc    Get user's experiment submissions
// @route   GET /api/experiments/my-submissions
// @access  Private
const getMySubmissions = async (req, res) => {
  try {
    const experiments = await Experiment.find({
      'submissions.user': req.user.id
    })
    .select('title slug multimedia.featuredImage submissions.$')
    .populate('submissions.user', 'name');

    const submissions = experiments.map(exp => ({
      experiment: {
        id: exp._id,
        title: exp.title,
        slug: exp.slug,
        featuredImage: exp.multimedia.featuredImage
      },
      submission: exp.submissions.find(sub => sub.user._id.toString() === req.user.id)
    }));

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your submissions'
    });
  }
};

// @desc    Get featured experiments
// @route   GET /api/experiments/featured
// @access  Public
const getFeaturedExperiments = async (req, res) => {
  try {
    const experiments = await Experiment.find({ 
      status: 'published',
      featured: true 
    })
    .populate('author', 'name profile.avatar')
    .sort('-publishedAt')
    .limit(6)
    .lean();

    res.status(200).json({
      success: true,
      data: experiments
    });
  } catch (error) {
    console.error('Get featured experiments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured experiments'
    });
  }
};

// @desc    Get popular experiments
// @route   GET /api/experiments/popular
// @access  Public
const getPopularExperiments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const experiments = await Experiment.getPopularExperiments(limit);

    res.status(200).json({
      success: true,
      data: experiments
    });
  } catch (error) {
    console.error('Get popular experiments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular experiments'
    });
  }
};

module.exports = {
  getExperiments,
  getExperiment,
  createExperiment,
  updateExperiment,
  deleteExperiment,
  submitExperimentResult,
  getExperimentSubmissions,
  reviewSubmission,
  getMySubmissions,
  getFeaturedExperiments,
  getPopularExperiments
};