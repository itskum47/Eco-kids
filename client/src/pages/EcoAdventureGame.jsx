import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import FactCard from '../components/game/FactCard';
import QuizPopup from '../components/game/QuizPopup';
import { getFactsForGrade, getGradeGroup, getGradeGroupMeta, getQuestionsForGrade } from '../utils/gradeContent';
import { clamp, cycleIndex, getUserEcoCoins, getUserGrade, submitGameActivity } from '../utils/gameSession';

const ADVENTURE_LEVELS = {
  Primary: [
    {
      title: 'Garden Trail',
      safeItems: [
        { emoji: '🍎', label: 'Fruit', points: 8 },
        { emoji: '🍃', label: 'Leaf', points: 8 },
        { emoji: '💧', label: 'Raindrop', points: 8 },
        { emoji: '🌱', label: 'Seedling', points: 8 },
      ],
      hazards: [{ emoji: '🗑️', label: 'Trash bag', points: -4 }, { emoji: '🚬', label: 'Litter', points: -4 }],
    },
    {
      title: 'Forest Path',
      safeItems: [
        { emoji: '🍊', label: 'Orange', points: 10 },
        { emoji: '🍀', label: 'Leaf', points: 10 },
        { emoji: '🌧️', label: 'Rain', points: 10 },
        { emoji: '🌳', label: 'Tree', points: 10 },
      ],
      hazards: [{ emoji: '🗑️', label: 'Trash bag', points: -5 }, { emoji: '☠️', label: 'Pollution', points: -5 }],
    },
    {
      title: 'River Rescue',
      safeItems: [
        { emoji: '🍌', label: 'Banana', points: 12 },
        { emoji: '💦', label: 'Water', points: 12 },
        { emoji: '🌿', label: 'Plant', points: 12 },
        { emoji: '🪴', label: 'Sapling', points: 12 },
      ],
      hazards: [{ emoji: '🗑️', label: 'Trash bag', points: -6 }, { emoji: '🛢️', label: 'Oil spill', points: -6 }],
    },
  ],
  Junior: [
    {
      title: 'Recycle Run',
      safeItems: [
        { emoji: '📰', label: 'Newspaper', points: 12 },
        { emoji: '🫙', label: 'Glass jar', points: 12 },
        { emoji: '🥫', label: 'Metal can', points: 12 },
        { emoji: '📦', label: 'Cardboard box', points: 12 },
      ],
      hazards: [{ emoji: '🗑️', label: 'Trash bag', points: -5 }, { emoji: '🔥', label: 'Burning waste', points: -5 }],
    },
    {
      title: 'Clean Street',
      safeItems: [
        { emoji: '🥤', label: 'Drink can', points: 14 },
        { emoji: '🧴', label: 'Plastic bottle', points: 14 },
        { emoji: '📄', label: 'Paper sheet', points: 14 },
        { emoji: '🍶', label: 'Refill bottle', points: 14 },
      ],
      hazards: [{ emoji: '🛍️', label: 'Single-use plastic', points: -6 }, { emoji: '🛢️', label: 'Leak', points: -6 }],
    },
    {
      title: 'Van Mahotsav Sprint',
      safeItems: [
        { emoji: '🪴', label: 'Sapling', points: 16 },
        { emoji: '🌳', label: 'Native tree', points: 16 },
        { emoji: '💧', label: 'Water can', points: 16 },
        { emoji: '🧤', label: 'Cleaning gloves', points: 16 },
      ],
      hazards: [{ emoji: '🗑️', label: 'Open dump', points: -7 }, { emoji: '🚯', label: 'Litter spot', points: -7 }],
    },
  ],
  Middle: [
    {
      title: 'Renewable Alley',
      safeItems: [
        { emoji: '☀️', label: 'Solar panel', points: 16, co2Saved: 6 },
        { emoji: '💨', label: 'Wind turbine', points: 16, co2Saved: 8 },
        { emoji: '🚲', label: 'Cycle lane', points: 12, co2Saved: 4 },
        { emoji: '🔋', label: 'Battery storage', points: 14, co2Saved: 5 },
      ],
      hazards: [{ emoji: '🏭', label: 'Smokestack', points: -8 }, { emoji: '🛢️', label: 'Oil drum', points: -8 }],
    },
    {
      title: 'Green India Drive',
      safeItems: [
        { emoji: '🌳', label: 'Urban tree', points: 18, co2Saved: 7 },
        { emoji: '🚆', label: 'Metro pass', points: 16, co2Saved: 5 },
        { emoji: '💡', label: 'LED retrofit', points: 14, co2Saved: 4 },
        { emoji: '♻️', label: 'Material recovery', points: 14, co2Saved: 4 },
      ],
      hazards: [{ emoji: '🚚', label: 'Diesel truck', points: -9 }, { emoji: '🗑️', label: 'Mixed waste', points: -9 }],
    },
    {
      title: 'Climate Mission Dash',
      safeItems: [
        { emoji: '🔆', label: 'Solar rooftop', points: 20, co2Saved: 8 },
        { emoji: '🚰', label: 'Water audit', points: 14, co2Saved: 4 },
        { emoji: '🌿', label: 'Wetland patch', points: 16, co2Saved: 6 },
        { emoji: '🚌', label: 'Electric bus', points: 18, co2Saved: 7 },
      ],
      hazards: [{ emoji: '🏭', label: 'Coal smoke', points: -10 }, { emoji: '☣️', label: 'Toxic runoff', points: -10 }],
    },
  ],
  Senior: [
    {
      title: 'Policy Corridor',
      safeItems: [
        { emoji: '📜', label: 'Climate policy', points: 18, co2Saved: 12 },
        { emoji: '☀️', label: 'Solar panel', points: 16, co2Saved: 10 },
        { emoji: '🏢', label: 'GRIHA building', points: 16, co2Saved: 8 },
        { emoji: '🚲', label: 'Mobility plan', points: 14, co2Saved: 6 },
      ],
      hazards: [{ emoji: '🛢️', label: 'Fuel leak', points: -10 }, { emoji: '🏭', label: 'Unfiltered stack', points: -10 }],
    },
    {
      title: 'Net Zero Street',
      safeItems: [
        { emoji: '📘', label: 'EIA report', points: 18, co2Saved: 10 },
        { emoji: '🔋', label: 'Storage unit', points: 15, co2Saved: 8 },
        { emoji: '🌧️', label: 'Water reuse', points: 15, co2Saved: 7 },
        { emoji: '🌱', label: 'Phytoremediation bed', points: 16, co2Saved: 8 },
      ],
      hazards: [{ emoji: '🚯', label: 'Illegal dumping', points: -12 }, { emoji: '🚗', label: 'Congestion', points: -12 }],
    },
    {
      title: 'Sustainability Arcade',
      safeItems: [
        { emoji: '📊', label: 'Emission audit', points: 18, co2Saved: 12 },
        { emoji: '💨', label: 'Wind farm', points: 18, co2Saved: 11 },
        { emoji: '🌊', label: 'Wetland buffer', points: 16, co2Saved: 8 },
        { emoji: '🧪', label: 'Water lab', points: 15, co2Saved: 7 },
      ],
      hazards: [{ emoji: '🔥', label: 'Open burning', points: -12 }, { emoji: '☠️', label: 'Contaminated soil', points: -12 }],
    },
  ],
  Higher: [
    {
      title: 'Transit Decision',
      prompt: 'Your city budget can fund one transport upgrade this year.',
      options: [
        { label: 'Build electric bus lanes', impact: 20, planet: 16, budget: -18 },
        { label: 'Subsidise private diesel parking', impact: -10, planet: -12, budget: -8 },
        { label: 'Upgrade cycle tracks and footpaths', impact: 16, planet: 12, budget: -12 },
      ],
    },
    {
      title: 'Energy Decision',
      prompt: 'Peak summer demand is rising. Choose the best climate-safe option.',
      options: [
        { label: 'Add rooftop solar plus storage', impact: 24, planet: 18, budget: -20 },
        { label: 'Extend the coal backup plant', impact: -12, planet: -14, budget: -10 },
        { label: 'Run an energy-efficiency retrofit drive', impact: 18, planet: 14, budget: -14 },
      ],
    },
    {
      title: 'Waste Decision',
      prompt: 'Landfill methane is rising. Which policy protects long-term planet health?',
      options: [
        { label: 'Mandate source segregation and composting', impact: 22, planet: 16, budget: -16 },
        { label: 'Ignore waste data for this year', impact: -14, planet: -16, budget: 0 },
        { label: 'Scale EPR and material recovery centres', impact: 20, planet: 14, budget: -18 },
      ],
    },
  ],
};

const buildLaneItems = (level) => {
  const items = [...level.safeItems.map((item) => ({ ...item, kind: 'safe' })), ...level.hazards.map((item) => ({ ...item, kind: 'hazard' }))];
  return items.sort(() => Math.random() - 0.5);
};

const getQuizRule = (gradeGroup, levelNumber) => {
  if (gradeGroup === 'Senior' || gradeGroup === 'Higher') {
    return true;
  }

  if (gradeGroup === 'Middle') {
    return levelNumber % 3 === 0;
  }

  return false;
};

const EcoAdventureGame = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const grade = getUserGrade(user);
  const ecoCoins = getUserEcoCoins(user);

  const [gradeGroup, setGradeGroup] = useState('Middle');
  const [phase, setPhase] = useState('start');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [lives, setLives] = useState(3);
  const [co2Saved, setCo2Saved] = useState(0);
  const [planetHealth, setPlanetHealth] = useState(72);
  const [cityBudget, setCityBudget] = useState(100);
  const [laneItems, setLaneItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [lastCollected, setLastCollected] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [sessionSubmitted, setSessionSubmitted] = useState(false);

  useEffect(() => {
    setGradeGroup(getGradeGroup(user?.grade));
  }, [user?.grade]);

  const facts = useMemo(() => getFactsForGrade(grade), [grade]);
  const questions = useMemo(() => getQuestionsForGrade(grade), [grade]);
  const gradeMeta = useMemo(() => getGradeGroupMeta(grade), [grade]);
  const levels = ADVENTURE_LEVELS[gradeGroup];
  const currentLevel = levels[currentLevelIndex];
  const isSimulationMode = gradeGroup === 'Higher';

  const resetLevel = (levelIndex = currentLevelIndex) => {
    const nextLevel = ADVENTURE_LEVELS[gradeGroup][levelIndex];
    if (!nextLevel || gradeGroup === 'Higher') {
      setLaneItems([]);
      setSelectedItems([]);
      return;
    }

    setLaneItems(buildLaneItems(nextLevel));
    setSelectedItems([]);
  };

  const startGame = () => {
    setPhase('play');
    setCurrentLevelIndex(0);
    setScore(0);
    setQuestionsCorrect(0);
    setLives(3);
    setCo2Saved(0);
    setPlanetHealth(72);
    setCityBudget(100);
    setLastCollected('');
    setSessionSubmitted(false);
    setStartTime(Date.now());
    resetLevel(0);
  };

  const completeGameIfNeeded = async (finalScore) => {
    if (sessionSubmitted || !startTime) {
      return;
    }

    setSessionSubmitted(true);
    await submitGameActivity({
      gameId: 'EcoAdventureGame',
      pointsEarned: finalScore,
      grade,
      timeSpent: Math.max(1, Math.round((Date.now() - startTime) / 1000)),
      questionsCorrect,
    });
  };

  const finishLevel = async () => {
    const levelNumber = currentLevelIndex + 1;
    const isLastLevel = levelNumber >= levels.length;

    if (isLastLevel) {
      await completeGameIfNeeded(score);
    }

    if (getQuizRule(gradeGroup, levelNumber)) {
      setPhase('quiz');
      return;
    }

    setPhase('fact');
  };

  useEffect(() => {
    resetLevel(currentLevelIndex);
  }, [currentLevelIndex, gradeGroup]);

  const handleLaneSelection = async (item, index) => {
    if (phase !== 'play' || selectedItems.includes(index)) {
      return;
    }

    setSelectedItems((previous) => [...previous, index]);
    setLastCollected(item.label);

    if (item.kind === 'safe') {
      setScore((previous) => previous + item.points);
      setCo2Saved((previous) => previous + (item.co2Saved || 0));
    } else {
      setScore((previous) => Math.max(0, previous + item.points));
      setLives((previous) => previous - 1);
    }

    const safeCount = laneItems.filter((laneItem) => laneItem.kind === 'safe').length;
    const nextSelectedCount = selectedItems.length + (item.kind === 'safe' ? 1 : 0);

    if (item.kind === 'safe' && nextSelectedCount >= safeCount) {
      await finishLevel();
    }
  };

  useEffect(() => {
    if (phase === 'play' && lives <= 0 && gradeGroup !== 'Higher') {
      completeGameIfNeeded(score).finally(() => setPhase('summary'));
    }
  }, [lives, phase, gradeGroup, score]);

  const handleSimulationChoice = async (option) => {
    if (phase !== 'play') {
      return;
    }

    setScore((previous) => Math.max(0, previous + option.impact));
    setPlanetHealth((previous) => clamp(previous + option.planet, 0, 100));
    setCityBudget((previous) => clamp(previous + option.budget, 0, 100));
    setCo2Saved((previous) => Math.max(0, previous + Math.max(option.impact, 0)));
    setLastCollected(option.label);
    await finishLevel();
  };

  const handleQuizComplete = async ({ isCorrect }) => {
    if (isCorrect) {
      setScore((previous) => previous + 10);
      setQuestionsCorrect((previous) => previous + 1);
    }

    setPhase('fact');
  };

  const handleFactNext = async () => {
    const nextLevelIndex = currentLevelIndex + 1;

    if (nextLevelIndex >= levels.length) {
      await completeGameIfNeeded(score);
      setPhase('summary');
      return;
    }

    setCurrentLevelIndex(nextLevelIndex);
    setPhase('play');
  };

  const levelFact = cycleIndex(facts, currentLevelIndex);
  const quizQuestion = cycleIndex(questions, currentLevelIndex);
  const safeItemsRemaining = laneItems.filter((item, index) => item.kind === 'safe' && !selectedItems.includes(index)).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfccb,_#dcfce7_38%,_#f8fafc_100%)] px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-6xl pt-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-emerald-100 bg-white/85 p-5 shadow-xl backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t('gameHub.adventure.title')}</p>
            <h1 className="text-3xl font-black text-slate-900">{currentLevel?.title || t('gameHub.ui.gameComplete')}</h1>
            <p className="text-sm text-slate-600">
              {t('gameHub.ui.gradeBand')}: {gradeMeta.shortLabel} · {t('gameHub.ui.ageRange')}: {gradeMeta.ageRange}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-3 text-sm font-bold">
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">{t('gameHub.ui.ecoCoins')}: {ecoCoins}</div>
            <div className="rounded-full bg-sky-50 px-4 py-2 text-sky-700">{t('gameHub.ui.level')}: {currentLevelIndex + 1}/{levels.length}</div>
            <div className="rounded-full bg-amber-50 px-4 py-2 text-amber-700">{t('gameHub.ui.score')}: {score}</div>
          </div>
        </div>

        {phase === 'start' && (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-xl">
              <h2 className="mb-3 text-4xl font-black text-slate-900">{t('gameHub.adventure.hero')}</h2>
              <p className="mb-5 max-w-3xl text-base leading-7 text-slate-600">{t('gameHub.adventure.description')}</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-emerald-50 p-4">
                  <div className="mb-2 text-2xl">🎒</div>
                  <div className="font-black text-slate-900">{t('gameHub.adventure.collect')}</div>
                  <p className="text-sm text-slate-600">{isSimulationMode ? t('gameHub.adventure.simulateCity') : t('gameHub.adventure.collectPrompt')}</p>
                </div>
                <div className="rounded-3xl bg-sky-50 p-4">
                  <div className="mb-2 text-2xl">🧠</div>
                  <div className="font-black text-slate-900">{t('gameHub.adventure.quizCheck')}</div>
                  <p className="text-sm text-slate-600">{t('gameHub.adventure.quizPrompt')}</p>
                </div>
                <div className="rounded-3xl bg-lime-50 p-4">
                  <div className="mb-2 text-2xl">📚</div>
                  <div className="font-black text-slate-900">{t('gameHub.adventure.curriculum')}</div>
                  <p className="text-sm text-slate-600">{t('gameHub.adventure.curriculumPrompt')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startGame}
                className="mt-8 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] hover:bg-emerald-700"
              >
                {t('gameHub.ui.startGame')}
              </button>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black">{t('gameHub.ui.gradeProfile')}</h3>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">{gradeMeta.shortLabel}</span>
              </div>
              <p className="mb-4 text-sm text-white/75">{isSimulationMode ? t('gameHub.adventure.higherMode') : t('gameHub.adventure.defaultMode')}</p>
              <div className="space-y-3 text-sm text-white/80">
                <div>• {t('gameHub.adventure.primaryRule')}</div>
                <div>• {t('gameHub.adventure.middleRule')}</div>
                <div>• {t('gameHub.adventure.seniorRule')}</div>
              </div>
            </div>
          </div>
        )}

        {phase === 'play' && !isSimulationMode && (
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="space-y-5 rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t('gameHub.ui.missionStatus')}</div>
                <h2 className="mt-2 text-2xl font-black text-slate-900">{currentLevel.title}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-3xl bg-slate-100 p-4 text-sm font-bold text-slate-700">
                  {t('gameHub.ui.safeItemsLeft')}: {safeItemsRemaining}
                </div>
                <div className="rounded-3xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
                  {t('gameHub.ui.lives')}: {Array.from({ length: Math.max(lives, 0) }, () => '❤️').join(' ') || '0'}
                </div>
                <div className="rounded-3xl bg-sky-50 p-4 text-sm font-bold text-sky-700">
                  {gradeGroup === 'Junior'
                    ? `${t('gameHub.ui.lastCollected')}: ${lastCollected || t('gameHub.ui.waiting')}`
                    : `${t('gameHub.ui.co2Saved')}: ${co2Saved} kg`}
                </div>
                {gradeGroup === 'Senior' && (
                  <div className="rounded-3xl bg-amber-50 p-4 text-sm font-bold text-amber-700">
                    {t('gameHub.adventure.realStat', { value: co2Saved || 22 })}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-[34px] border border-emerald-100 bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between text-white/80">
                <span className="text-sm font-black uppercase tracking-[0.18em]">{t('gameHub.adventure.sideScroll')}</span>
                <span className="text-sm">{t('gameHub.adventure.tapCollect')}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                {laneItems.map((item, index) => {
                  const isSelected = selectedItems.includes(index);
                  const isPrimary = gradeGroup === 'Primary';

                  return (
                    <motion.button
                      type="button"
                      key={`${item.label}-${index}`}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSelected}
                      onClick={() => handleLaneSelection(item, index)}
                      className={`rounded-[26px] border p-5 text-left transition ${
                        item.kind === 'safe'
                          ? 'border-emerald-300 bg-white text-slate-900'
                          : 'border-rose-300 bg-rose-50 text-rose-900'
                      } ${isSelected ? 'opacity-40' : ''}`}
                    >
                      <div className="mb-3 text-5xl">{item.emoji}</div>
                      {!isPrimary && <div className="text-sm font-black">{item.label}</div>}
                      {!isPrimary && <div className="mt-2 text-xs font-bold text-slate-500">{item.kind === 'safe' ? t('gameHub.ui.collect') : t('gameHub.ui.avoid')}</div>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {phase === 'play' && isSimulationMode && (
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="space-y-4 rounded-[30px] border border-emerald-100 bg-white p-6 shadow-xl">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t('gameHub.adventure.simulationMode')}</div>
              <h2 className="text-3xl font-black text-slate-900">{currentLevel.title}</h2>
              <p className="text-sm leading-7 text-slate-600">{currentLevel.prompt}</p>
              <div className="rounded-3xl bg-slate-950 p-4 text-white">
                <div className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-white/70">{t('gameHub.adventure.planetMeter')}</div>
                <div className="mb-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400" style={{ width: `${planetHealth}%` }} />
                </div>
                <div className="mb-2 text-sm">{t('gameHub.ui.planetHealth')}: {planetHealth}%</div>
                <div className="text-sm">{t('gameHub.ui.cityBudget')}: {cityBudget}</div>
              </div>
            </div>
            <div className="grid gap-4">
              {currentLevel.options.map((option) => (
                <button
                  type="button"
                  key={option.label}
                  onClick={() => handleSimulationChoice(option)}
                  className="rounded-[30px] border border-emerald-100 bg-white p-6 text-left shadow-xl transition hover:-translate-y-1"
                >
                  <div className="mb-2 text-lg font-black text-slate-900">{option.label}</div>
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{t('gameHub.ui.score')}: {option.impact > 0 ? '+' : ''}{option.impact}</span>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{t('gameHub.ui.planetHealth')}: {option.planet > 0 ? '+' : ''}{option.planet}</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{t('gameHub.ui.cityBudget')}: {option.budget}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'quiz' && (
            <QuizPopup key="adventure-quiz" question={quizQuestion} onComplete={handleQuizComplete} />
          )}
          {phase === 'fact' && (
            <FactCard
              key="adventure-fact"
              fact={levelFact}
              buttonLabel={currentLevelIndex + 1 >= levels.length ? t('gameHub.ui.playAgain') : t('gameHub.ui.nextLevel')}
              onNext={handleFactNext}
            />
          )}
          {phase === 'summary' && (
            <motion.div
              key="adventure-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[34px] border border-emerald-100 bg-white p-8 shadow-2xl"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t('gameHub.ui.sessionSummary')}</div>
                  <h2 className="text-3xl font-black text-slate-900">{t('gameHub.ui.gameComplete')}</h2>
                </div>
                <button
                  type="button"
                  onClick={startGame}
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white"
                >
                  {t('gameHub.ui.playAgain')}
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl bg-emerald-50 p-4 text-center">
                  <div className="text-sm font-bold text-emerald-700">{t('gameHub.ui.score')}</div>
                  <div className="text-3xl font-black text-slate-900">{score}</div>
                </div>
                <div className="rounded-3xl bg-sky-50 p-4 text-center">
                  <div className="text-sm font-bold text-sky-700">{t('gameHub.ui.co2Saved')}</div>
                  <div className="text-3xl font-black text-slate-900">{co2Saved} kg</div>
                </div>
                <div className="rounded-3xl bg-amber-50 p-4 text-center">
                  <div className="text-sm font-bold text-amber-700">{t('gameHub.ui.quizCorrect')}</div>
                  <div className="text-3xl font-black text-slate-900">{questionsCorrect}</div>
                </div>
                <div className="rounded-3xl bg-lime-50 p-4 text-center">
                  <div className="text-sm font-bold text-lime-700">{t('gameHub.ui.planetHealth')}</div>
                  <div className="text-3xl font-black text-slate-900">{planetHealth}%</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EcoAdventureGame;