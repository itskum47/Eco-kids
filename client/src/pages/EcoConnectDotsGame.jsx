import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { submitGameScore } from '../store/slices/gamesSlice';
import GameHeader from '../components/game/GameHeader';
import GameSummaryStats from '../components/game/GameSummaryStats';
import { getFactsForGrade, getGradeGroupMeta } from '../utils/gradeContent';
import { getGameConfig } from '../utils/gradeGameConfig';
import { getUserGrade } from '../utils/gameSession';

const PATTERNS = [
  {
    name: 'Tree',
    dots: [
      { x: 2, y: 0, id: 1 }, { x: 1, y: 1, id: 2 }, { x: 3, y: 1, id: 3 },
      { x: 0, y: 2, id: 4 }, { x: 2, y: 2, id: 5 }, { x: 4, y: 2, id: 6 },
      { x: 2, y: 3, id: 7 }, { x: 2, y: 4, id: 8 },
    ],
    emoji: 'T',
  },
  {
    name: 'Recycling Symbol',
    dots: [
      { x: 1, y: 0, id: 1 }, { x: 3, y: 0, id: 2 }, { x: 0, y: 1, id: 3 },
      { x: 2, y: 1, id: 4 }, { x: 4, y: 1, id: 5 }, { x: 1, y: 2, id: 6 },
      { x: 3, y: 2, id: 7 }, { x: 2, y: 3, id: 8 },
    ],
    emoji: 'R',
  },
  {
    name: 'Water Drop',
    dots: [
      { x: 2, y: 0, id: 1 }, { x: 1, y: 1, id: 2 }, { x: 3, y: 1, id: 3 },
      { x: 0, y: 2, id: 4 }, { x: 4, y: 2, id: 5 }, { x: 1, y: 3, id: 6 },
      { x: 3, y: 3, id: 7 }, { x: 2, y: 4, id: 8 },
    ],
    emoji: 'W',
  },
];

const EcoConnectDotsGame = ({ onGameComplete }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const grade = getUserGrade(user);
  const gradeMeta = getGradeGroupMeta(grade);
  const facts = useMemo(() => getFactsForGrade(grade), [grade]);
  const config = useMemo(() => getGameConfig('connectDots', grade), [grade]);

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [connectedDots, setConnectedDots] = useState([]);
  const [score, setScore] = useState(0);

  const targetPattern = PATTERNS[levelIndex % PATTERNS.length];

  const startGame = () => {
    setStarted(true);
    setCompleted(false);
    setLevelIndex(0);
    setConnectedDots([]);
    setScore(0);
  };

  const finishGame = async (finalScore) => {
    setCompleted(true);
    if (isAuthenticated && finalScore > 0) {
      try {
        await dispatch(submitGameScore({ gameId: 'eco-connect-dots-game', score: finalScore }));
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
    onGameComplete?.(finalScore);
  };

  const completeLevel = async () => {
    const nextScore = score + config.pointsPerLevel;
    const nextLevel = levelIndex + 1;

    if (nextLevel >= config.requiredLevels) {
      setScore(nextScore);
      await finishGame(nextScore);
      return;
    }

    setScore(nextScore);
    setLevelIndex(nextLevel);
    setConnectedDots([]);
  };

  const connectDot = (dotId) => {
    if (connectedDots.includes(dotId) || completed) {
      return;
    }

    const updated = [...connectedDots, dotId];
    setConnectedDots(updated);

    if (updated.length >= targetPattern.dots.length) {
      window.setTimeout(() => {
        completeLevel();
      }, 350);
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen px-4 pb-12 pt-8 md:px-8">
        <div className="mx-auto max-w-5xl pt-16">
          <GameHeader
            theme="cyan"
            eyebrow={t('gameHub.connectDots.title')}
            title={t('gameHub.connectDots.hero')}
            subtitle={`${t('gameHub.gradeBand')}: ${gradeMeta.shortLabel}`}
            badges={[
              { id: 'levels', label: `${t('gameHub.levelsDone')}: 0/${config.requiredLevels}`, className: 'bg-cyan-50 text-cyan-700' },
            ]}
          />

          <div className="rounded-[30px] border border-cyan-100 bg-white p-8 text-center shadow-xl">
            <p className="mb-6 text-gray-600">{t('gameHub.connectDots.description')}</p>
            <p className="mb-6 rounded-2xl bg-cyan-50 p-4 text-sm font-semibold text-cyan-700">
              {t(facts[0]?.textKey, { defaultValue: facts[0]?.text || t('gameHub.funFact') })}
            </p>
            <button onClick={startGame} className="rounded-lg bg-cyan-600 px-8 py-3 font-semibold text-white hover:bg-cyan-700">
              {t('gameHub.startConnecting')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <GameHeader
        theme="cyan"
        eyebrow={t('gameHub.connectDots.title')}
        title={`${targetPattern.name} (${targetPattern.emoji})`}
        subtitle={t('gameHub.connectDots.tapHint')}
        badges={[
          { id: 'score', label: `${t('gameHub.score')}: ${score}`, className: 'bg-emerald-50 text-emerald-700' },
          { id: 'level', label: `${t('gameHub.level')}: ${levelIndex + 1}/${config.requiredLevels}`, className: 'bg-sky-50 text-sky-700' },
          { id: 'progress', label: `${t('gameHub.progress')}: ${connectedDots.length}/${targetPattern.dots.length}`, className: 'bg-amber-50 text-amber-700' },
        ]}
      />

      <div className="rounded-[30px] bg-[var(--s1)] p-8 shadow-lg">
        <div className="relative mx-auto rounded-lg bg-cyan-50 p-8" style={{ width: '400px', height: '400px' }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            {connectedDots.map((dotId, index) => {
              if (index === 0) return null;
              const currentDot = targetPattern.dots.find((d) => d.id === dotId);
              const previousDot = targetPattern.dots.find((d) => d.id === connectedDots[index - 1]);

              return (
                <line
                  key={`${previousDot.id}-${currentDot.id}`}
                  x1={`${(previousDot.x / 4) * 100}%`}
                  y1={`${(previousDot.y / 4) * 100}%`}
                  x2={`${(currentDot.x / 4) * 100}%`}
                  y2={`${(currentDot.y / 4) * 100}%`}
                  stroke="#0f766e"
                  strokeWidth="3"
                />
              );
            })}
          </svg>

          {targetPattern.dots.map((dot) => {
            const isConnected = connectedDots.includes(dot.id);
            return (
              <button
                key={dot.id}
                onClick={() => connectDot(dot.id)}
                disabled={isConnected || completed}
                className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full text-sm font-bold text-white transition ${isConnected ? 'bg-emerald-600' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                style={{ left: `${(dot.x / 4) * 100}%`, top: `${(dot.y / 4) * 100}%` }}
              >
                {dot.id}
              </button>
            );
          })}
        </div>
      </div>

      {completed && (
        <div className="mt-6">
          <GameSummaryStats
            title={t('gameHub.gameComplete')}
            ctaLabel={t('gameHub.playAgain')}
            onCta={startGame}
            stats={[
              { id: 'score', label: t('gameHub.score'), value: score, className: 'bg-emerald-50 text-emerald-700' },
              { id: 'levels', label: t('gameHub.levelsDone'), value: `${config.requiredLevels}/${config.requiredLevels}`, className: 'bg-sky-50 text-sky-700' },
              { id: 'impact', label: t('gameHub.sustainabilityScore'), value: Math.min(100, score), className: 'bg-lime-50 text-lime-700' },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default EcoConnectDotsGame;
