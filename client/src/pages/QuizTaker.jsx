import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../utils/api';
import confetti from 'canvas-confetti';
import { useGradeBand } from '../hooks/useGradeBand';
import { useTranslation } from 'react-i18next';

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const LightningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

const QuizTaker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { band } = useGradeBand();
  const { t } = useTranslation();

  const [quiz, setQuiz] = useState({ title: 'Loading...', description: '', questions: [], timeLimitMinutes: 10, scoring: { passingScore: 70 } });
  const [loading, setLoading] = useState(true);

  // States
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState({ type: '', message: '' });

  // Gamification states
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchQuiz();
    // eslint-disable-next-line
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (quizStarted && !showResults && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizStarted, showResults, timeRemaining]); // eslint-disable-line

  useEffect(() => {
    setShowReportForm(false);
    setReportText('');
    setReportFeedback({ type: '', message: '' });
  }, [currentQuestionIndex]);

  const fetchQuiz = async () => {
    try {
      const response = await apiRequest(`/v1/quizzes/${id}`);
      if (!response || !response.data) {
        throw new Error('Invalid quiz data received');
      }
      
      setQuiz(response.data);
      setTimeRemaining(response.data.timeLimitMinutes ? response.data.timeLimitMinutes * 60 : 300);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      if (error?.response?.status === 401) {
        navigate('/login');
      } else {
        navigate('/quizzes');
      }
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setSelectedOption(null);
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;

    const currentQ = quiz.questions[currentQuestionIndex];
    let isCorrect = false;

    if (currentQ.questionType === 'multiple-choice') {
      const selected = currentQ.options.find(o => o._id === selectedOption);
      if (selected && selected.isCorrect) isCorrect = true;
    } else {
      if (selectedOption === currentQ.correctOption || selectedOption === currentQ.options.find(o => o.isCorrect)?._id) isCorrect = true;
    }

    if (isCorrect) {
      setStreak(s => s + 1);
      if (streak >= 1) setMultiplier(2);
      if (streak >= 3) setMultiplier(3);
    } else {
      setStreak(0);
      setMultiplier(1);
    }

    setAnswers(prev => ({ ...prev, [currentQ._id]: selectedOption }));

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    setShowResults(true);
    setQuizStarted(false);

    const scoreVal = Math.floor(Math.random() * 40) + 60; // Mock score for now
    const isPassed = scoreVal >= (quiz.scoring?.passingScore || 60);

    const mockResults = {
      passed: isPassed,
      score: { percentage: scoreVal, correct: 2, total: quiz.questions.length },
      ecoPointsEarned: isPassed ? (quiz.ecoPointsReward || 50) * multiplier : 0,
      timeSpent: timeSpent,
      maxStreak: streak,
      highestMultiplier: multiplier
    };

    setResults(mockResults);

    if (isPassed) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#4ade80', '#38bdf8', '#facc15'] });
    }
  };

  const handleSubmitQuestionReport = async () => {
    if (!currentQuestion?._id) {
      return;
    }

    if (!reportText.trim() || reportText.trim().length < 10) {
      setReportFeedback({ type: 'error', message: 'Please enter at least 10 characters.' });
      return;
    }

    try {
      setReportSubmitting(true);
      setReportFeedback({ type: '', message: '' });

      await apiRequest('post', `/v1/content/quiz/${id}/report`, {
        question_id: currentQuestion._id,
        report_text: reportText.trim()
      });

      setReportText('');
      setShowReportForm(false);
      setReportFeedback({ type: 'success', message: 'Issue reported successfully.' });
    } catch (error) {
      setReportFeedback({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to submit report.'
      });
    } finally {
      setReportSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--eco-green)] rounded-full animate-spin" />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex) / quiz.questions.length) * 100;

  // Adaptive Styling
  const isKiddie = band === 'seedling';
  const isExpert = band === 'expert' || band === 'challenger';

  const headerFontClass = isKiddie ? "font-['Fredoka_One']" : isExpert ? "font-['DM_Sans'] font-bold" : "font-['Nunito'] font-black";
  const bodyFontClass = isKiddie ? "font-['Nunito'] text-lg" : isExpert ? "font-['Nunito_Sans']" : "font-['Nunito']";
  const primaryColor = isKiddie ? "text-[var(--eco-green)]" : isExpert ? "text-gray-900" : "text-[var(--eco-dark)]";

  return (
    <div className={`min-h-screen ${isExpert ? 'bg-gray-100' : 'bg-white'} text-[var(--text-primary)] flex flex-col relative`}>

      {/* TOP NAVIGATION BAR */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <button onClick={() => navigate('/quizzes')} className="flex items-center gap-2 font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <CloseIcon /> {isKiddie ? t('quizTaker.leaveQuiz') : isExpert ? t('quizTaker.abortAssessment') : t('quizTaker.exit')}
        </button>

        {/* Progress Bar + Streak */}
        {quizStarted && !showResults && (
          <div className="flex-1 max-w-[500px] mx-4 md:mx-8 hidden sm:flex items-center gap-4">
            <div className={`font-mono text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${streak >= 1 ? 'text-[var(--sun)] bg-[var(--sun-light)] border border-yellow-300' : 'text-gray-500 bg-gray-100 border border-gray-200'}`}>
              <LightningIcon /> x{multiplier}
            </div>

            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden relative">
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-[var(--eco-green)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {quizStarted && !showResults && (
          <div className={`font-mono text-lg font-bold ${timeRemaining <= 30 ? 'text-red-500 animate-pulse' : 'text-[var(--eco-dark)]'}`}>
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10 px-4 py-8">

        {/* Intro Screen */}
        {!quizStarted && !showResults && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`max-w-[700px] w-full p-8 md:p-12 text-center bg-white border ${isExpert ? 'border-gray-300 rounded-[12px] shadow-sm' : 'border-gray-200 rounded-[32px] shadow-[var(--shadow-lg)]'} relative overflow-hidden`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6 text-blue-800 font-bold text-xs uppercase tracking-wider">
              <span className="text-sm">{isKiddie ? '🧩' : '📝'}</span>
              <span>{isKiddie ? t('quizTaker.quizTime') : t('quizTaker.moduleOutline')}</span>
            </div>

            <h1 className={`${headerFontClass} text-4xl md:text-5xl mb-6 ${primaryColor}`}>{quiz.title}</h1>
            <p className={`${bodyFontClass} text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto`}>{quiz.description}</p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center min-w-[120px]">
                <div className="font-mono text-3xl font-bold text-[var(--eco-dark)]">{quiz.questions?.length || 0}</div>
                <div className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mt-1">{t('quizTaker.questions')}</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center min-w-[120px]">
                <div className="font-mono text-3xl font-bold text-[var(--sun)]">{quiz.timeLimitMinutes || 5}m</div>
                <div className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mt-1">{t('quizTaker.timeLimit')}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center min-w-[120px]">
                <div className="font-mono text-3xl font-bold text-[var(--eco-green)]">{quiz.scoring?.passingScore}%</div>
                <div className="font-bold text-[10px] text-green-700 uppercase tracking-widest mt-1">{t('quizTaker.passMark')}</div>
              </div>
            </div>

            <button onClick={startQuiz} className={`bg-[var(--eco-green)] hover:bg-[var(--eco-dark)] text-white px-12 py-4 rounded-full ${isKiddie ? "font-['Fredoka_One'] text-xl" : "font-bold tracking-widest uppercase"} shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all`}>
              {isKiddie ? t('quizTaker.letsPlay') : isExpert ? t('quizTaker.initializeRun') : t('quizTaker.startQuiz')}
            </button>
          </motion.div>
        )}

        {/* Question Screen */}
        {quizStarted && currentQuestion && !showResults && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[800px] flex flex-col items-center"
            >
              <div className="sm:hidden font-mono text-[12px] text-gray-500 mb-4">
                {t('quizTaker.nodeProgress', { current: currentQuestionIndex + 1, total: quiz.questions.length })}
              </div>

              <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 font-bold text-[10px] uppercase tracking-widest text-[var(--sky)] mb-8">
                {currentQuestion.questionType === 'multiple-choice' ? t('quizTaker.multipleChoice') : t('quizTaker.trueFalse')}
              </div>

              <h2 className={`${headerFontClass} text-3xl md:text-4xl text-center leading-tight ${primaryColor} mb-12 max-w-3xl`}>
                {currentQuestion.questionText}
              </h2>

              <div className="w-full max-w-3xl mb-6">
                {!showReportForm ? (
                  <button
                    onClick={() => {
                      setShowReportForm(true);
                      setReportFeedback({ type: '', message: '' });
                    }}
                    className="text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    Report an issue in this question
                  </button>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      rows={3}
                      placeholder="Describe factual error, unclear wording, or incorrect options..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[var(--eco-green)]"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={handleSubmitQuestionReport}
                        disabled={reportSubmitting}
                        className="px-4 py-2 rounded-full bg-[var(--eco-green)] text-white text-xs font-bold uppercase tracking-widest disabled:opacity-60"
                      >
                        {reportSubmitting ? 'Submitting...' : 'Submit report'}
                      </button>
                      <button
                        onClick={() => {
                          setShowReportForm(false);
                          setReportText('');
                        }}
                        className="text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {reportFeedback.message && (
                  <p className={`mt-2 text-xs font-semibold ${reportFeedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {reportFeedback.message}
                  </p>
                )}
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.questionType === 'multiple-choice' ? (
                  currentQuestion.options.map((option, idx) => {
                    const optionId = option._id || option;
                    const isSelected = selectedOption === optionId;
                    return (
                      <button
                        key={optionId}
                        onClick={() => handleOptionSelect(optionId)}
                        className={`relative p-6 ${isExpert ? 'rounded-lg' : 'rounded-2xl'} border text-left flex items-start gap-4 transition-all duration-200 ${isSelected
                          ? 'bg-[var(--eco-pale)] border-[var(--eco-green)] shadow-md -translate-y-1'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-0.5'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                          ? 'bg-[var(--eco-green)] border-[var(--eco-green)] text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                          }`}>
                          {isSelected ? <CheckIcon /> : <span className="font-mono text-[11px] font-bold">{String.fromCharCode(65 + idx)}</span>}
                        </div>
                        <span className={`${bodyFontClass} leading-snug transition-colors ${isSelected ? 'text-[var(--eco-dark)] font-bold' : 'text-gray-700'}`}>
                          {option.optionText || option}
                        </span>
                      </button>
                    )
                  })
                ) : (
                  ['True', 'False'].map(option => {
                    const isSelected = selectedOption === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        className={`relative p-8 ${isExpert ? 'rounded-lg' : 'rounded-[24px]'} border text-center flex flex-col items-center justify-center gap-3 transition-all duration-200 ${isSelected
                          ? 'bg-[var(--eco-pale)] border-[var(--eco-green)] shadow-md -translate-y-1'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-0.5'
                          }`}
                      >
                        <span className={`${headerFontClass} text-4xl transition-colors ${isSelected ? 'text-[var(--eco-green)]' : 'text-gray-400'}`}>
                          {option}
                        </span>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4 text-[var(--eco-green)]">
                            <CheckIcon />
                          </motion.div>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Results Screen */}
        {showResults && results && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`max-w-[700px] w-full text-center py-10 bg-white border ${isExpert ? 'border-gray-300 rounded-[12px]' : 'border-gray-200 rounded-[32px]'} p-8 md:p-12 shadow-[var(--shadow-lg)]`}>

            <div className="relative inline-block mb-10 mt-4">
              <svg width="220" height="220" className="transform -rotate-90">
                <circle cx="110" cy="110" r="100" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="110" cy="110" r="100"
                  stroke={results.passed ? "var(--eco-green)" : "var(--coral)"}
                  strokeWidth="8" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 100}
                  initial={{ strokeDashoffset: 2 * Math.PI * 100 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 100) - ((results.score.percentage / 100) * 2 * Math.PI * 100) }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className={`${headerFontClass} text-5xl ${results.passed ? 'text-[var(--eco-green)]' : 'text-[var(--coral)]'}`}
                >
                  {results.score.percentage}%
                </motion.span>
                <div className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mt-2">{t('quizTaker.accuracy')}</div>
              </div>
            </div>

            <h2 className={`${headerFontClass} text-4xl mb-6 ${results.passed ? 'text-[var(--eco-dark)]' : 'text-[var(--coral)]'}`}>
              {results.passed ? (isKiddie ? t('quizTaker.successTitleKiddie') : t('quizTaker.successTitle')) : (isKiddie ? t('quizTaker.failTitleKiddie') : t('quizTaker.failTitle'))}
            </h2>

            <p className={`${bodyFontClass} text-gray-600 mb-8 max-w-md mx-auto leading-relaxed`}>
              {results.passed
                ? t('quizTaker.successBody')
                : t('quizTaker.failBody', { score: quiz.scoring?.passingScore })}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-[120px]">
                <div className="font-mono text-xl font-bold text-gray-700">{formatTime(results.timeSpent)}</div>
                <div className="font-bold text-[10px] text-gray-400 uppercase tracking-widest mt-1">{t('quizTaker.time')}</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 min-w-[120px]">
                <div className="font-mono text-xl font-bold text-[var(--sun)]">{results.maxStreak}</div>
                <div className="font-bold text-[10px] text-yellow-600 uppercase tracking-widest mt-1">{t('quizTaker.maxStreak')}</div>
              </div>

              {results.passed && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 min-w-[120px] shadow-sm">
                  <div className="font-mono text-xl font-bold text-[var(--eco-green)]">+{results.ecoPointsEarned}</div>
                  <div className="font-bold text-[10px] text-green-700 uppercase tracking-widest mt-1">{t('quizTaker.xpEarned')}</div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/quizzes')} className="px-8 py-3.5 rounded-full font-bold text-[12px] uppercase tracking-wider bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                {isKiddie ? t('quizTaker.backToGames') : t('quizTaker.returnToBase')}
              </button>
              {!results.passed && (
                <button onClick={() => window.location.reload()} className="px-8 py-3.5 rounded-full font-bold text-[12px] uppercase tracking-wider bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors shadow-sm">
                  {isKiddie ? t('quizTaker.tryAgain') : t('quizTaker.retrySequence')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* BOTTOM BAR - Submit Answer */}
      {quizStarted && !showResults && (
        <div className="relative z-20 w-full border-t border-gray-200 bg-white/90 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="font-mono text-[11px] tracking-widest text-gray-400 group flex items-center gap-2 cursor-help relative">
            <span className="w-6 h-6 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center font-bold text-[12px] group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">?</span>
            <span className="hidden sm:inline">{t('quizTaker.requestHint')}</span>

            <div className="absolute bottom-[calc(100%+12px)] left-0 p-4 bg-gray-900 border border-gray-700 rounded-[12px] text-xs w-[280px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-white shadow-lg">
              {t('quizTaker.hintPenalty')}
              <div className="absolute -bottom-2 left-6 w-3 h-3 bg-gray-900 border-b border-r border-gray-700 transform rotate-45" />
            </div>
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOption}
            className={`px-8 md:px-12 py-3.5 rounded-full font-bold text-[13px] tracking-widest uppercase transition-all duration-300 ${selectedOption
              ? 'bg-[var(--eco-green)] text-white shadow-md hover:shadow-lg hover:-translate-y-1 translate-y-0 opacity-100'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed translate-y-2 opacity-50 shadow-none'
              }`}
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? (isKiddie ? t('quizTaker.next') : t('quizTaker.verifyLink')) : (isKiddie ? t('quizTaker.finish') : t('quizTaker.finalizeRun'))}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;