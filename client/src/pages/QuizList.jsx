import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../utils/api';
import GradeAdaptive from '../components/GradeAdaptive';
import { useGradeBand } from '../hooks/useGradeBand';

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'var(--eco-green)';
    case 'medium': return 'var(--sun)';
    case 'hard': return 'var(--coral)';
    default: return 'var(--eco-green)';
  }
};

const SeedlingQuizCard = ({ quiz, isCompleted, bestScore, t }) => (
  <Link to={`/quiz/${quiz.slug || quiz._id}`} className="block bg-[#fff3e0] border-4 border-[#ffb74d] rounded-[32px] p-6 text-center hover:scale-105 transition-transform shadow-[var(--shadow-card)] relative overflow-hidden">
    {isCompleted && (
      <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-sm text-2xl animate-bounce">
        ⭐
      </div>
    )}
    <div className="text-6xl mb-4">🧩</div>
    <h3 className="font-['Fredoka_One'] text-2xl text-[var(--eco-dark)] mb-4 leading-tight">
      {quiz.title}
    </h3>
    <div className="flex justify-center gap-3 mb-6">
      <span className="bg-white text-[var(--eco-dark)] font-bold px-3 py-1 rounded-full shadow-sm text-sm">
        {quiz.questionCount || 5} {t('quizList.questionsShort')}
      </span>
      <span className="bg-white text-[var(--eco-dark)] font-bold px-3 py-1 rounded-full shadow-sm text-sm">
        {quiz.timeLimitMinutes || 5} {t('quizList.minutesShort')}
      </span>
    </div>
    <div className={`inline-block w-full ${isCompleted ? 'bg-[var(--eco-pale)] border-2 border-[var(--eco-green)] text-[var(--eco-green)]' : 'bg-[var(--eco-green)] text-white'} font-['Fredoka_One'] text-xl px-6 py-4 rounded-full shadow-[var(--shadow-sm)]`}>
      {isCompleted ? t('quizList.playAgain') : t('quizList.startQuiz')}
    </div>
  </Link>
);

const ExplorerQuizCard = ({ quiz, isCompleted, bestScore }) => {
  const diffColor = getDifficultyColor(quiz.difficulty);
  const { t } = useTranslation();
  return (
    <Link to={`/quiz/${quiz.slug || quiz._id}`} className="bg-white border border-gray-200 rounded-[20px] p-6 hover:-translate-y-1 hover:shadow-lg transition-all shadow-[var(--shadow-sm)] flex flex-col h-full relative overflow-hidden">
      {isCompleted && (
        <div className="absolute top-0 right-0 bg-green-100 text-green-700 font-bold px-4 py-1 text-xs rounded-bl-lg">
          {t('quizList.bestScore')}: {bestScore}%
        </div>
      )}
      <div className="flex justify-between items-start mb-4 pt-1">
        <span className="font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full border" style={{ color: diffColor, borderColor: diffColor, backgroundColor: `${diffColor}15` }}>
          {quiz.difficulty}
        </span>
        <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">{t('grades.class')} {quiz.minGrade}-{quiz.maxGrade}</span>
      </div>

      <h3 className="font-['Nunito'] font-black text-xl text-[var(--text-primary)] mb-2 line-clamp-2">
        {quiz.title}
      </h3>

      <p className="text-[var(--text-secondary)] text-sm mb-6 flex-1 line-clamp-2">
        {quiz.description}
      </p>

      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
        <div className="flex gap-4 text-sm font-bold text-gray-500">
          <span>📝 {quiz.questionCount || 10} {t('quizList.questionsShort')}</span>
          <span>⏱️ {quiz.timeLimitMinutes || 5}{t('quizList.minuteSuffix')}</span>
        </div>
        <div className={`font-bold px-4 py-2 rounded-full text-sm ${isCompleted ? 'bg-gray-100 text-gray-600' : 'bg-[var(--sky)] text-white shadow-sm hover:shadow'}`}>
          {isCompleted ? t('quizList.retry') : t('quizList.start')} &rarr;
        </div>
      </div>
    </Link>
  );
};

const ExpertQuizCard = ({ quiz, isCompleted, bestScore }) => {
  const { t } = useTranslation();

  return (
  <Link to={`/quiz/${quiz.slug || quiz._id}`} className={`border rounded-[8px] p-5 hover:border-gray-500 transition-colors h-full flex flex-col relative ${isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-300'}`}>
    <div className="flex justify-between items-start mb-3">
      <div className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
        MOD-ID: {quiz._id?.substring(0, 6) || 'QZ101'}
      </div>
      {isCompleted ? (
        <div className="font-mono text-xs font-bold text-green-600 border border-green-300 bg-green-50 px-2 py-1">
          {t('quizList.passed')} ({bestScore}%)
        </div>
      ) : (
        <div className="font-mono text-xs font-bold text-gray-500 border border-gray-200 px-2 py-1">
          {t('quizList.pending')}
        </div>
      )}
    </div>

    <h3 className="font-['DM_Sans'] font-bold text-lg text-gray-900 mb-2 leading-snug">
      {quiz.title}
    </h3>

    <div className="text-sm text-gray-600 mb-6 flex-1 line-clamp-2">
      {quiz.description}
    </div>

    <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-3 pb-4 mb-4 text-center">
      <div>
        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{t('quizList.time')}</div>
        <div className="font-mono text-sm">{quiz.timeLimitMinutes}m</div>
      </div>
      <div className="border-l border-r border-gray-200">
        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{t('quizList.items')}</div>
        <div className="font-mono text-sm">{quiz.questionCount}</div>
      </div>
      <div>
        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{t('quizList.pass')}</div>
        <div className="font-mono text-sm">{quiz.passThreshold || 70}%</div>
      </div>
    </div>

    <div className={`mt-auto text-center font-mono text-sm py-2 px-4 transition-colors ${isCompleted ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
      {isCompleted ? t('quizList.reassess') : t('quizList.commenceAssessment')}
    </div>
  </Link>
  );
};

const QuizListCard = ({ quiz, index }) => {
  const { t } = useTranslation();
  const bestScore = quiz.bestScore || 0;
  const isCompleted = bestScore > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="h-full"
    >
      <GradeAdaptive
        seedling={<SeedlingQuizCard quiz={quiz} isCompleted={isCompleted} bestScore={bestScore} t={t} />}
        explorer={<ExplorerQuizCard quiz={quiz} isCompleted={isCompleted} bestScore={bestScore} />}
        challenger={<ExpertQuizCard quiz={quiz} isCompleted={isCompleted} bestScore={bestScore} />}
        expert={<ExpertQuizCard quiz={quiz} isCompleted={isCompleted} bestScore={bestScore} />}
        fallback={<ExplorerQuizCard quiz={quiz} isCompleted={isCompleted} bestScore={bestScore} />}
      />
    </motion.div>
  );
};

const QuizList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeGrade = searchParams.get('grade') || 'all';

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { band } = useGradeBand();
  const { t } = useTranslation();

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGrade]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeGrade !== 'all') params.append('grade', activeGrade);

      const response = await apiRequest(`/v1/quizzes?${params.toString()}`);
      if (response && response.data) {
        setQuizzes(response.data.quizzes || response.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // Mock data
      setQuizzes([
        { _id: '1', title: 'Basic Waste Sorting', minGrade: 1, maxGrade: 2, difficulty: 'Easy', questionCount: 5, timeLimitMinutes: 5, description: 'Can you tell the difference between wet waste and dry waste? Test your knowledge with these 5 quick questions.', bestScore: 0 },
        { _id: '2', title: 'The Water Cycle', minGrade: 3, maxGrade: 4, difficulty: 'Medium', questionCount: 10, timeLimitMinutes: 8, description: 'Test your knowledge on evaporation, condensation, precipitation, and collection.', bestScore: 80 },
        { _id: '3', title: 'Renewable vs Non-Renewable', minGrade: 5, maxGrade: 6, difficulty: 'Medium', questionCount: 10, timeLimitMinutes: 10, description: 'Categorize energy sources correctly. Learn what powers our future versus what harms it.', bestScore: 0 },
        { _id: '4', title: 'Ecosystem Balance', minGrade: 7, maxGrade: 8, difficulty: 'Hard', questionCount: 15, timeLimitMinutes: 12, description: 'Complex questions regarding food webs, energy pyramids, and how keystone species hold environments together.', bestScore: 0 },
        { _id: '5', title: 'Climate Change Impacts', minGrade: 9, maxGrade: 10, difficulty: 'Hard', questionCount: 15, timeLimitMinutes: 15, description: 'Analyze global warming effects, greenhouse gases, sea-level rise, and strategic mitigation.', bestScore: 90 },
        { _id: '6', title: 'Sustainable Development Goals', minGrade: 11, maxGrade: 12, difficulty: 'Hard', questionCount: 20, timeLimitMinutes: 20, description: 'Advanced quiz covering the 17 UN SDGs, international environmental policies, and India\'s targets.', bestScore: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (grade) => {
    const newParams = new URLSearchParams(searchParams);
    if (grade === 'all') newParams.delete('grade');
    else newParams.set('grade', grade);
    setSearchParams(newParams);
  };

  const filteredQuizzes = quizzes.filter(q => {
    if (activeGrade === 'all') return true;
    const currentGradeInt = parseInt(activeGrade, 10);
    return currentGradeInt >= q.minGrade && currentGradeInt <= q.maxGrade;
  });

  return (
    <div className={`min-h-screen ${band === 'expert' || band === 'challenger' ? 'bg-gray-100' : 'bg-[var(--page-bg)]'} pt-20 pb-24 relative overflow-hidden`}>
      <Navbar />

      <div className="max-w-[1240px] mx-auto px-6 relative z-10">

        {/* Header Section */}
        <div className="py-10 mb-8 mt-4">
          <GradeAdaptive
            seedling={<h1 className="font-['Fredoka_One'] text-6xl text-[var(--eco-green)] mb-4">Eco Quiz Time! 🧩</h1>}
            explorer={<h1 className="font-['Nunito'] font-black text-5xl text-[var(--eco-dark)] mb-4">Knowledge Check</h1>}
            challenger={<h1 className="font-['DM_Sans'] font-bold text-4xl text-gray-900 mb-4">{t('quizList.assessmentModules')}</h1>}
            expert={<h1 className="font-['DM_Sans'] font-bold text-4xl text-gray-900 mb-4">{t('quizList.assessmentModules')}</h1>}
            fallback={<h1 className="font-['Nunito'] font-black text-5xl text-[var(--eco-dark)] mb-4">{t('quizList.knowledgeCheck')}</h1>}
          />
          <p className="font-body text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed mt-4">
            {t('quizList.intro')}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGradeChange('all')}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all border ${activeGrade === 'all'
                ? 'bg-[var(--eco-green)] border-[var(--eco-green)] text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-500 hover:border-[var(--eco-green)]'
                }`}
            >
              {t('quizList.allGrades')}
            </button>
            {grades.map(g => {
              const isActive = activeGrade === g;
              return (
                <button
                  key={g}
                  onClick={() => handleGradeChange(g)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all border ${isActive
                    ? 'bg-[var(--eco-green)] border-[var(--eco-green)] text-white shadow-md scale-105'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  {t('grades.class')} {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[var(--coral)] animate-spin" />
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 ${band === 'expert' || band === 'challenger' ? 'lg:grid-cols-4 gap-4' : 'lg:grid-cols-3 gap-6'}`}>
            {filteredQuizzes.map((quiz, index) => (
              <QuizListCard key={quiz._id} quiz={quiz} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-[var(--border)] shadow-sm">
            <div className="text-4xl mb-4 opacity-50">📋</div>
            <h3 className="font-bold text-2xl text-[var(--text-primary)] mb-2">{t('quizList.noQuizzesTitle')}</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">{t('quizList.noQuizzesSubtitle')}</p>
            <button
              onClick={() => handleGradeChange('all')}
              className="px-6 py-3 rounded-full border border-[var(--border-strong)] font-bold text-sm hover:bg-[var(--eco-pale)] transition-colors"
            >
              {t('quizList.clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;