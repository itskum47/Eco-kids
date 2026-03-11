import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import FactCard from '../components/game/FactCard';
import QuizPopup from '../components/game/QuizPopup';
import { getFactsForGrade, getGradeGroup, getGradeGroupMeta, getQuestionsForGrade, getVocabForGrade } from '../utils/gradeContent';
import { clamp, cycleIndex, getUserEcoCoins, getUserGrade, submitGameActivity } from '../utils/gameSession';

const MAZE_LEVELS = {
  Primary: [
    {
      size: 4,
      start: { x: 0, y: 0 },
      goal: { x: 3, y: 3 },
      walls: ['1,1', '2,1'],
      checkpoints: ['1,2'],
      pathStats: { forest: 'Gentle green path', river: 'Cool water path' },
    },
    {
      size: 4,
      start: { x: 0, y: 0 },
      goal: { x: 3, y: 3 },
      walls: ['1,0', '1,1', '2,2'],
      checkpoints: ['2,1'],
      pathStats: { forest: 'Tree-lined route', river: 'Raindrop route' },
    },
  ],
  Junior: [
    {
      size: 6,
      start: { x: 0, y: 0 },
      goal: { x: 5, y: 5 },
      walls: ['1,1', '1,2', '3,3', '4,1', '4,2'],
      checkpoints: ['2,2'],
      lockedDoor: '3,1',
      pathStats: { forest: 'Forest path stores more rainwater.', river: 'River path shows clean water zones.' },
    },
    {
      size: 6,
      start: { x: 0, y: 0 },
      goal: { x: 5, y: 5 },
      walls: ['2,1', '2,2', '2,3', '4,4'],
      checkpoints: ['1,4'],
      lockedDoor: '4,2',
      pathStats: { forest: 'Forest route supports biodiversity.', river: 'River route protects wetlands.' },
    },
  ],
  Middle: [
    {
      size: 8,
      start: { x: 0, y: 0 },
      goal: { x: 7, y: 7 },
      walls: ['1,1', '1,2', '2,4', '3,4', '5,2', '5,3'],
      checkpoints: ['2,5', '5,5'],
      labels: { '0,2': 'river', '3,1': 'forest', '6,4': 'city' },
      stats: { river: 'River route: 70% of India\'s surface water needs better treatment.', forest: 'Forest route: trees help reduce heat and erosion.', city: 'City route: urban heat islands raise temperature 2-3°C.' },
    },
    {
      size: 8,
      start: { x: 0, y: 0 },
      goal: { x: 7, y: 7 },
      walls: ['1,3', '2,3', '3,3', '5,4', '6,4'],
      checkpoints: ['4,2', '6,6'],
      labels: { '2,0': 'forest', '4,5': 'river', '6,2': 'city' },
      stats: { river: 'River route: watershed protection helps communities downstream.', forest: 'Forest route: habitat corridors support wildlife movement.', city: 'City route: cleaner transit lowers local emissions.' },
    },
  ],
  Senior: [
    {
      size: 10,
      start: { x: 0, y: 0 },
      goal: { x: 9, y: 9 },
      walls: ['1,1', '1,2', '2,2', '3,4', '4,4', '6,2', '7,2', '7,6'],
      checkpoints: ['4,1', '7,7'],
      pollutedZones: ['5,3', '8,4'],
      labels: { '2,0': 'forest', '5,5': 'city', '8,1': 'river' },
      stats: { river: 'Polluted river zone: dissolved oxygen drops when nutrient load rises.', forest: 'Forest zone: land cover reduces runoff and supports carbon storage.', city: 'City zone: transport choices shift local CO₂ and PM levels.' },
    },
    {
      size: 10,
      start: { x: 0, y: 0 },
      goal: { x: 9, y: 9 },
      walls: ['2,1', '3,1', '4,1', '4,2', '4,3', '6,5', '7,5', '8,5'],
      checkpoints: ['3,7', '8,8'],
      pollutedZones: ['1,6', '6,2'],
      labels: { '0,4': 'river', '3,5': 'forest', '7,1': 'city' },
      stats: { river: 'River zone: eutrophication can follow fertilizer runoff.', forest: 'Forest zone: biodiversity loss weakens ecosystem resilience.', city: 'City zone: policy choices change emissions and exposure.' },
    },
  ],
  Higher: [
    {
      size: 10,
      start: { x: 0, y: 0 },
      goal: { x: 9, y: 9 },
      walls: ['1,1', '2,1', '3,1', '4,3', '5,3', '6,3', '7,6'],
      checkpoints: ['4,6', '8,8'],
      pollutedZones: ['6,1', '7,2'],
      labels: { '1,4': 'city', '4,1': 'forest', '8,3': 'river' },
      stats: { river: 'River route: nature-based solutions improve water security.', forest: 'Forest route: agroforestry and restoration improve carbon sequestration.', city: 'City route: policy packages reshape urban carbon budgets.' },
      policies: [
        { label: 'Public transit first', openWalls: ['3,1'], health: 8 },
        { label: 'Wetland restoration', openWalls: ['6,3'], health: 6 },
        { label: 'Status quo', openWalls: [], health: -6 },
      ],
    },
    {
      size: 10,
      start: { x: 0, y: 0 },
      goal: { x: 9, y: 9 },
      walls: ['1,2', '2,2', '3,2', '5,5', '6,5', '7,5', '8,5'],
      checkpoints: ['2,7', '7,7'],
      pollutedZones: ['5,1', '8,2'],
      labels: { '1,5': 'river', '5,2': 'forest', '7,1': 'city' },
      stats: { river: 'River route: EPR and circular design reduce leakage to waterways.', forest: 'Forest route: biodiversity policy protects ecosystem services.', city: 'City route: energy efficiency lowers demand-side emissions.' },
      policies: [
        { label: 'Circular economy package', openWalls: ['7,5'], health: 7 },
        { label: 'Green hydrogen pilot', openWalls: ['3,2'], health: 5 },
        { label: 'Delay investment', openWalls: [], health: -7 },
      ],
    },
  ],
};

const DIRECTION_BUTTONS = [
  { id: 'up', label: '↑' },
  { id: 'left', label: '←' },
  { id: 'down', label: '↓' },
  { id: 'right', label: '→' },
];

const EcoMazeGame = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const grade = getUserGrade(user);
  const ecoCoins = getUserEcoCoins(user);

  const [gradeGroup, setGradeGroup] = useState('Middle');
  const [phase, setPhase] = useState('start');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [ppmPenalty, setPpmPenalty] = useState(0);
  const [policyChoice, setPolicyChoice] = useState(null);
  const [planetHealth, setPlanetHealth] = useState(76);
  const [checkpointVocab, setCheckpointVocab] = useState(null);
  const [pathInsight, setPathInsight] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setGradeGroup(getGradeGroup(user?.grade));
  }, [user?.grade]);

  const facts = useMemo(() => getFactsForGrade(grade), [grade]);
  const questions = useMemo(() => getQuestionsForGrade(grade), [grade]);
  const vocab = useMemo(() => getVocabForGrade(grade), [grade]);
  const gradeMeta = useMemo(() => getGradeGroupMeta(grade), [grade]);
  const levels = MAZE_LEVELS[gradeGroup];
  const currentLevel = levels[currentLevelIndex];

  const currentWalls = useMemo(() => {
    if (!currentLevel) {
      return new Set();
    }

    const walls = new Set(currentLevel.walls);
    if (gradeGroup === 'Higher' && policyChoice?.openWalls) {
      policyChoice.openWalls.forEach((wallKey) => walls.delete(wallKey));
    }

    return walls;
  }, [currentLevel, gradeGroup, policyChoice]);

  const resetLevel = (levelIndex = currentLevelIndex) => {
    const nextLevel = levels[levelIndex];
    setPosition(nextLevel.start);
    setDoorUnlocked(false);
    setCheckpointVocab(null);
    setPathInsight('');
    if (gradeGroup === 'Higher') {
      setPolicyChoice(null);
    }
  };

  const startGame = () => {
    setPhase(gradeGroup === 'Higher' ? 'policy' : 'play');
    setCurrentLevelIndex(0);
    setScore(0);
    setQuestionsCorrect(0);
    setPpmPenalty(0);
    setPlanetHealth(76);
    setSubmitted(false);
    setStartTime(Date.now());
    setPosition(levels[0].start);
    setDoorUnlocked(false);
    setCheckpointVocab(null);
    setPathInsight('');
    setPolicyChoice(null);
  };

  useEffect(() => {
    resetLevel(currentLevelIndex);
  }, [currentLevelIndex, gradeGroup]);

  const finishSession = async () => {
    if (submitted || !startTime) {
      return;
    }

    setSubmitted(true);
    await submitGameActivity({
      gameId: 'EcoMazeGame',
      pointsEarned: score,
      grade,
      timeSpent: Math.max(1, Math.round((Date.now() - startTime) / 1000)),
      questionsCorrect,
    });
  };

  const getCellKey = (x, y) => `${x},${y}`;

  const canMoveTo = (x, y) => {
    if (x < 0 || y < 0 || x >= currentLevel.size || y >= currentLevel.size) {
      return false;
    }

    const key = getCellKey(x, y);
    if (currentWalls.has(key)) {
      return false;
    }

    if (currentLevel.lockedDoor === key && !doorUnlocked) {
      return false;
    }

    return true;
  };

  const move = (direction) => {
    if (phase !== 'play') {
      return;
    }

    const nextPosition = { ...position };
    if (direction === 'up') nextPosition.y -= 1;
    if (direction === 'down') nextPosition.y += 1;
    if (direction === 'left') nextPosition.x -= 1;
    if (direction === 'right') nextPosition.x += 1;

    const targetKey = getCellKey(nextPosition.x, nextPosition.y);

    if (!canMoveTo(nextPosition.x, nextPosition.y)) {
      if (currentLevel.lockedDoor === targetKey && !doorUnlocked) {
        setPhase('quiz');
      }
      return;
    }

    setPosition(nextPosition);
    setScore((previous) => previous + 4);

    if (currentLevel.checkpoints.includes(targetKey)) {
      setCheckpointVocab(cycleIndex(vocab, currentLevelIndex + nextPosition.x + nextPosition.y));
    }

    const label = currentLevel.labels?.[targetKey];
    if (label) {
      setPathInsight(currentLevel.stats?.[label] || '');
    }

    if (currentLevel.pollutedZones?.includes(targetKey)) {
      setPpmPenalty((previous) => previous + 50);
      setPlanetHealth((previous) => clamp(previous - 6, 0, 100));
    }

    if (nextPosition.x === currentLevel.goal.x && nextPosition.y === currentLevel.goal.y) {
      if (currentLevelIndex + 1 >= levels.length) {
        finishSession().finally(() => setPhase('summary'));
      } else {
        setPhase('fact');
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') move('up');
      if (event.key === 'ArrowDown') move('down');
      if (event.key === 'ArrowLeft') move('left');
      if (event.key === 'ArrowRight') move('right');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleQuizComplete = ({ isCorrect }) => {
    if (isCorrect) {
      setQuestionsCorrect((previous) => previous + 1);
      setScore((previous) => previous + 10);
      setDoorUnlocked(true);
    }

    setPhase('play');
  };

  const handleFactNext = () => {
    const nextLevelIndex = currentLevelIndex + 1;
    setCurrentLevelIndex(nextLevelIndex);
    setPhase(gradeGroup === 'Higher' ? 'policy' : 'play');
  };

  const selectPolicy = (policy) => {
    setPolicyChoice(policy);
    setPlanetHealth((previous) => clamp(previous + policy.health, 0, 100));
    setPhase('play');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#ecfeff_35%,_#f8fafc_100%)] px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-6xl pt-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-cyan-100 bg-white/85 p-5 shadow-xl backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{t('gameHub.maze.title')}</p>
            <h1 className="text-3xl font-black text-slate-900">{t('gameHub.maze.hero')}</h1>
            <p className="text-sm text-slate-600">{t('gameHub.ui.gradeBand')}: {gradeMeta.shortLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <div className="rounded-full bg-cyan-50 px-4 py-2 text-cyan-700">{t('gameHub.ui.ecoCoins')}: {ecoCoins}</div>
            <div className="rounded-full bg-sky-50 px-4 py-2 text-sky-700">{t('gameHub.ui.level')}: {currentLevelIndex + 1}/{levels.length}</div>
            <div className="rounded-full bg-amber-50 px-4 py-2 text-amber-700">{t('gameHub.ui.score')}: {score}</div>
          </div>
        </div>

        {phase === 'start' && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-cyan-100 bg-white p-8 shadow-xl">
              <h2 className="mb-4 text-4xl font-black text-slate-900">{t('gameHub.maze.description')}</h2>
              <p className="mb-6 text-base leading-7 text-slate-600">{t('gameHub.maze.subtext')}</p>
              <button type="button" onClick={startGame} className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-black text-white">
                {t('gameHub.ui.startGame')}
              </button>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-white/60">{t('gameHub.ui.gradeProfile')}</div>
              <div className="space-y-3 text-sm text-white/80">
                <div>• {t('gameHub.maze.primaryRule')}</div>
                <div>• {t('gameHub.maze.juniorRule')}</div>
                <div>• {t('gameHub.maze.middleRule')}</div>
                <div>• {t('gameHub.maze.higherRule')}</div>
              </div>
            </div>
          </div>
        )}

        {(phase === 'play' || phase === 'policy') && (
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="space-y-4 rounded-[30px] border border-cyan-100 bg-white p-6 shadow-xl">
              <div className="rounded-3xl bg-cyan-50 p-4">
                <div className="text-sm font-black text-cyan-700">{t('gameHub.ui.checkpointWord')}</div>
                <div className="mt-2 text-lg font-black text-slate-900">
                  {checkpointVocab ? t(checkpointVocab.termKey, { defaultValue: checkpointVocab.term }) : t('gameHub.ui.waiting')}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {checkpointVocab ? t(checkpointVocab.meaningKey, { defaultValue: checkpointVocab.meaning }) : t('gameHub.maze.reachCheckpoint')}
                </div>
              </div>
              <div className="rounded-3xl bg-slate-100 p-4 text-sm font-bold text-slate-700">
                {t('gameHub.ui.pathInsight')}: {pathInsight || t('gameHub.ui.waiting')}
              </div>
              {(gradeGroup === 'Senior' || gradeGroup === 'Higher') && (
                <div className="rounded-3xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
                  CO₂ +{ppmPenalty} ppm
                </div>
              )}
              {gradeGroup === 'Higher' && (
                <div className="rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  {t('gameHub.ui.planetHealth')}: {planetHealth}%
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {DIRECTION_BUTTONS.map((button) => (
                  <button
                    type="button"
                    key={button.id}
                    onClick={() => move(button.id)}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-xl font-black text-white"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            {phase === 'policy' && gradeGroup === 'Higher' ? (
              <div className="grid gap-4">
                {currentLevel.policies.map((policy) => (
                  <button
                    type="button"
                    key={policy.label}
                    onClick={() => selectPolicy(policy)}
                    className="rounded-[30px] border border-cyan-100 bg-white p-6 text-left shadow-xl transition hover:-translate-y-1"
                  >
                    <div className="text-lg font-black text-slate-900">{policy.label}</div>
                    <div className="mt-2 text-sm text-slate-600">{t('gameHub.maze.policyDecision')}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`grid gap-2 rounded-[34px] border border-cyan-100 bg-white p-5 shadow-2xl`} style={{ gridTemplateColumns: `repeat(${currentLevel.size}, minmax(0, 1fr))` }}>
                {Array.from({ length: currentLevel.size * currentLevel.size }).map((_, index) => {
                  const x = index % currentLevel.size;
                  const y = Math.floor(index / currentLevel.size);
                  const key = getCellKey(x, y);
                  const isWall = currentWalls.has(key);
                  const isDoor = currentLevel.lockedDoor === key && !doorUnlocked;
                  const isCheckpoint = currentLevel.checkpoints.includes(key);
                  const isGoal = currentLevel.goal.x === x && currentLevel.goal.y === y;
                  const isPlayer = position.x === x && position.y === y;
                  const isPolluted = currentLevel.pollutedZones?.includes(key);

                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => {
                        if (gradeGroup === 'Primary') {
                          const deltaX = x - position.x;
                          const deltaY = y - position.y;
                          if (Math.abs(deltaX) + Math.abs(deltaY) === 1) {
                            if (deltaX === 1) move('right');
                            if (deltaX === -1) move('left');
                            if (deltaY === 1) move('down');
                            if (deltaY === -1) move('up');
                          }
                        }
                      }}
                      className={`aspect-square rounded-2xl border text-lg font-black ${
                        isPlayer
                          ? 'border-emerald-400 bg-emerald-500 text-white'
                          : isGoal
                            ? 'border-amber-300 bg-amber-100 text-amber-700'
                            : isWall
                              ? 'border-slate-700 bg-slate-800 text-slate-800'
                              : isDoor
                                ? 'border-violet-300 bg-violet-100 text-violet-700'
                                : isPolluted
                                  ? 'border-rose-300 bg-rose-100 text-rose-700'
                                  : isCheckpoint
                                    ? 'border-cyan-300 bg-cyan-100 text-cyan-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {isPlayer ? '🌱' : isGoal ? '⚡' : isDoor ? '🚪' : isCheckpoint ? '📚' : isPolluted ? '☣️' : currentLevel.labels?.[key] === 'river' ? '💧' : currentLevel.labels?.[key] === 'forest' ? '🌲' : currentLevel.labels?.[key] === 'city' ? '🏙️' : ''}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'quiz' && <QuizPopup key="maze-quiz" question={cycleIndex(questions, currentLevelIndex)} onComplete={handleQuizComplete} />}
          {phase === 'fact' && (
            <FactCard
              key="maze-fact"
              fact={cycleIndex(facts, currentLevelIndex)}
              buttonLabel={t('gameHub.ui.nextLevel')}
              onNext={handleFactNext}
            />
          )}
          {phase === 'summary' && (
            <motion.div key="maze-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[34px] border border-cyan-100 bg-white p-8 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{t('gameHub.ui.sessionSummary')}</div>
                  <h2 className="text-3xl font-black text-slate-900">{t('gameHub.ui.gameComplete')}</h2>
                </div>
                <button type="button" onClick={startGame} className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-black text-white">{t('gameHub.ui.playAgain')}</button>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl bg-cyan-50 p-4 text-center"><div className="text-sm font-bold text-cyan-700">{t('gameHub.ui.score')}</div><div className="text-3xl font-black text-slate-900">{score}</div></div>
                <div className="rounded-3xl bg-sky-50 p-4 text-center"><div className="text-sm font-bold text-sky-700">{t('gameHub.ui.quizCorrect')}</div><div className="text-3xl font-black text-slate-900">{questionsCorrect}</div></div>
                <div className="rounded-3xl bg-rose-50 p-4 text-center"><div className="text-sm font-bold text-rose-700">CO₂ ppm</div><div className="text-3xl font-black text-slate-900">+{ppmPenalty}</div></div>
                <div className="rounded-3xl bg-emerald-50 p-4 text-center"><div className="text-sm font-bold text-emerald-700">{t('gameHub.ui.planetHealth')}</div><div className="text-3xl font-black text-slate-900">{planetHealth}%</div></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EcoMazeGame;