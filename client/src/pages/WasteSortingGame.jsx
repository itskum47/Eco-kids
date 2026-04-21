import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { submitGameScore } from '../store/slices/gamesSlice';
import GameHeader from '../components/game/GameHeader';
import GameSummaryStats from '../components/game/GameSummaryStats';
import { getFactsForGrade, getGradeGroupMeta } from '../utils/gradeContent';
import { getGameConfig } from '../utils/gradeGameConfig';
import { getUserGrade } from '../utils/gameSession';

const WasteSortingGame = ({ onGameComplete }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const grade = getUserGrade(user);
  const gradeMeta = getGradeGroupMeta(grade);
  const facts = useMemo(() => getFactsForGrade(grade), [grade]);
  const config = useMemo(() => getGameConfig('waste', grade), [grade]);

  const [gameState, setGameState] = useState({
    score: 0,
    timeLeft: 120,
    gameStarted: false,
    gameCompleted: false,
    currentItem: null,
    sortedCorrectly: 0,
    totalItems: config.totalItems,
  });

  const wasteItems = [
    { name: 'Plastic Bottle', type: 'recyclable', emoji: '🍶' },
    { name: 'Banana Peel', type: 'organic', emoji: '🍌' },
    { name: 'Newspaper', type: 'recyclable', emoji: '📰' },
    { name: 'Battery', type: 'hazardous', emoji: '🔋' },
    { name: 'Apple Core', type: 'organic', emoji: '🍎' },
    { name: 'Glass Jar', type: 'recyclable', emoji: '🫙' },
    { name: 'Old Phone', type: 'electronic', emoji: '📱' },
    { name: 'Food Scraps', type: 'organic', emoji: '🥬' }
  ];

  const bins = [
    { type: 'recyclable', color: 'blue', emoji: '♻️', name: 'Recyclable' },
    { type: 'organic', color: 'green', emoji: '🌱', name: 'Organic' },
    { type: 'hazardous', color: 'red', emoji: '☢️', name: 'Hazardous' },
    { type: 'electronic', color: 'purple', emoji: '💻', name: 'Electronic' }
  ];

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameCompleted: false,
      score: 0,
      sortedCorrectly: 0,
      totalItems: config.totalItems,
      timeLeft: 90 + config.totalItems,
      currentItem: wasteItems[Math.floor(Math.random() * wasteItems.length)]
    }));
  };

  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameCompleted) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          window.clearInterval(timer);
          return { ...prev, timeLeft: 0, gameCompleted: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameState.gameStarted, gameState.gameCompleted]);

  useEffect(() => {
    if (gameState.gameCompleted && gameState.gameStarted) {
      if (onGameComplete) {
        onGameComplete(gameState.score);
      }
    }
  }, [gameState.gameCompleted]);

  const sortItem = (binType) => {
    if (!gameState.currentItem || gameState.gameCompleted) return;
    
    const correct = gameState.currentItem.type === binType;
    const points = correct ? config.pointsPerCorrect : config.pointsPerWrong;
    
    setGameState(prev => {
      const newScore = Math.max(0, prev.score + points);
      const newSorted = correct ? prev.sortedCorrectly + 1 : prev.sortedCorrectly;
      const completed = newSorted >= prev.totalItems;
      
      return {
        ...prev,
        score: newScore,
        sortedCorrectly: newSorted,
        gameCompleted: completed,
        currentItem: !completed ? wasteItems[Math.floor(Math.random() * wasteItems.length)] : null,
      };
    });
  };

  const endGame = async () => {
    setGameState(prev => ({ ...prev, gameCompleted: true }));
    
    if (isAuthenticated && gameState.score > 0) {
      try {
        await dispatch(submitGameScore({
          gameId: 'waste-sorting-game',
          score: gameState.score
        }));
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }

  };

  useEffect(() => {
    if (gameState.gameCompleted) {
      endGame();
    }
  }, [gameState.gameCompleted]);

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dcfce7,_#f0fdf4_35%,_#f8fafc_100%)] px-4 pb-12 pt-8 md:px-8">
        <div className="mx-auto max-w-5xl pt-16">
          <GameHeader
            theme="emerald"
            eyebrow={t('gameHub.waste.title')}
            title={t('gameHub.waste.hero')}
            subtitle={`${t('gameHub.gradeBand')}: ${gradeMeta.shortLabel}`}
            badges={[{ id: 'items', label: `${t('gameHub.levels')}: ${config.totalItems}`, className: 'bg-emerald-50 text-emerald-700' }]}
          />

          <div className="rounded-[30px] border border-emerald-100 bg-white p-8 shadow-xl">
            <p className="mb-6 text-base text-slate-600">{t('gameHub.waste.description')}</p>
            <div className="mb-6 rounded-2xl bg-lime-50 p-4 text-sm font-semibold text-lime-800">
              {t(facts[0]?.textKey, { defaultValue: facts[0]?.text || t('gameHub.funFact') })}
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              {t('gameHub.startSorting')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <GameHeader
        theme="emerald"
        eyebrow={t('gameHub.waste.title')}
        title={t('gameHub.waste.hero')}
        subtitle={`${t('gameHub.gradeBand')}: ${gradeMeta.shortLabel}`}
        badges={[
          { id: 'score', label: `${t('gameHub.score')}: ${gameState.score}`, className: 'bg-emerald-50 text-emerald-700' },
          { id: 'progress', label: `${t('gameHub.progress')}: ${gameState.sortedCorrectly}/${gameState.totalItems}`, className: 'bg-sky-50 text-sky-700' },
          { id: 'time', label: `${t('gameHub.timeLeft')}: ${gameState.timeLeft}s`, className: 'bg-amber-50 text-amber-700' },
        ]}
      />

      {gameState.currentItem && (
        <div className="bg-[var(--s1)] rounded-lg shadow-lg p-8 mb-6 text-center">
          <h3 className="text-2xl font-bold mb-4">Sort this item:</h3>
          <div className="text-6xl mb-4">{gameState.currentItem.emoji}</div>
          <div className="text-xl font-semibold">{gameState.currentItem.name}</div>
          <div className="mt-3 text-sm text-slate-600">{t('gameHub.waste.itemImpact')}</div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bins.map((bin) => (
          <button
            key={bin.type}
            onClick={() => sortItem(bin.type)}
            className={`p-6 rounded-lg shadow-lg text-white font-semibold hover:opacity-80 transition-opacity ${
              bin.color === 'blue' ? 'bg-blue-500' :
              bin.color === 'green' ? 'bg-green-500' :
              bin.color === 'red' ? 'bg-red-500' :
              'bg-purple-500'
            }`}
          >
            <div className="text-4xl mb-2">{bin.emoji}</div>
            <div>{bin.name}</div>
          </button>
        ))}
      </div>

      {gameState.gameCompleted && (
        <GameSummaryStats
          title={t('gameHub.gameComplete')}
          ctaLabel={t('gameHub.playAgain')}
          onCta={startGame}
          stats={[
            { id: 'score', label: t('gameHub.score'), value: gameState.score, className: 'bg-emerald-50 text-emerald-700' },
            { id: 'sorted', label: t('gameHub.sortedCorrectly'), value: gameState.sortedCorrectly, className: 'bg-sky-50 text-sky-700' },
            { id: 'landfill', label: t('gameHub.landfillDiverted'), value: `${Math.round(gameState.sortedCorrectly * 1.3)} kg`, className: 'bg-lime-50 text-lime-700' },
          ]}
        />
      )}
    </div>
  );
};

export default WasteSortingGame;