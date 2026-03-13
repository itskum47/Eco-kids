import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { submitGameScore } from '../store/slices/gamesSlice';
import GameHeader from '../components/game/GameHeader';
import GameSummaryStats from '../components/game/GameSummaryStats';
import { getFactsForGrade, getGradeGroupMeta, getVocabForGrade } from '../utils/gradeContent';
import { getGameConfig } from '../utils/gradeGameConfig';
import { getUserGrade } from '../utils/gameSession';

const MemoryMatchGame = ({ onGameComplete }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const grade = getUserGrade(user);
  const gradeMeta = getGradeGroupMeta(grade);
  const facts = useMemo(() => getFactsForGrade(grade), [grade]);
  const vocab = useMemo(() => getVocabForGrade(grade), [grade]);
  const config = useMemo(() => getGameConfig('memory', grade), [grade]);

  const cardPairs = useMemo(() => {
    const fallback = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return vocab.slice(0, config.pairCount).map((entry, index) => ({
      id: index + 1,
      symbol: entry.emoji || fallback[index % fallback.length],
      name: entry.term,
    }));
  }, [vocab, config.pairCount]);

  const [state, setState] = useState({
    cards: [],
    flipped: [],
    matched: [],
    moves: 0,
    score: 0,
    started: false,
    done: false,
    timeLeft: config.timeLimit,
  });

  const init = useCallback(() => {
    const cards = [...cardPairs, ...cardPairs]
      .map((card) => ({ ...card, uid: Math.random().toString(36).slice(2) }))
      .sort(() => Math.random() - 0.5);

    setState({
      cards,
      flipped: [],
      matched: [],
      moves: 0,
      score: 0,
      started: true,
      done: false,
      timeLeft: config.timeLimit,
    });
  }, [cardPairs, config.timeLimit]);

  const endGame = useCallback(async () => {
    const finalScore = Math.max(0, state.score + state.timeLeft * 3);

    if (isAuthenticated && finalScore > 0) {
      try {
        await dispatch(submitGameScore({ gameId: 'memory-match-game', score: finalScore }));
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }

    onGameComplete?.(finalScore);
  }, [dispatch, isAuthenticated, onGameComplete, state.score, state.timeLeft]);

  useEffect(() => {
    if (!state.started || state.done) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setState((prev) => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, done: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.started, state.done]);

  useEffect(() => {
    if (state.done && state.started) {
      endGame();
    }
  }, [state.done, state.started, endGame]);

  useEffect(() => {
    if (state.flipped.length !== 2) {
      return;
    }

    const [a, b] = state.flipped;
    const first = state.cards[a];
    const second = state.cards[b];
    const isMatch = first.id === second.id;

    const timeout = window.setTimeout(() => {
      setState((prev) => ({
        ...prev,
        flipped: [],
        matched: isMatch ? [...prev.matched, a, b] : prev.matched,
        moves: prev.moves + 1,
        score: isMatch ? prev.score + 80 : prev.score,
      }));
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [state.flipped, state.cards]);

  useEffect(() => {
    if (state.cards.length > 0 && state.matched.length === state.cards.length && !state.done) {
      setState((prev) => ({ ...prev, done: true }));
    }
  }, [state.cards.length, state.matched.length, state.done]);

  const flip = (index) => {
    if (!state.started || state.done || state.flipped.length >= 2 || state.flipped.includes(index) || state.matched.includes(index)) {
      return;
    }
    setState((prev) => ({ ...prev, flipped: [...prev.flipped, index] }));
  };

  const pairsFound = state.matched.length / 2;
  const totalPairs = state.cards.length / 2 || config.pairCount;

  if (!state.started) {
    return (
      <div className="min-h-screen px-4 pb-12 pt-8 md:px-8">
        <div className="mx-auto max-w-5xl pt-16">
          <GameHeader
            theme="violet"
            eyebrow={t('gameHub.memory.title')}
            title={t('gameHub.memory.hero')}
            subtitle={`${t('gameHub.ui.gradeBand')}: ${gradeMeta.shortLabel}`}
            badges={[
              { id: 'pairs', label: `${t('gameHub.ui.pairsFound')}: ${config.pairCount}`, className: 'bg-violet-50 text-violet-700' },
              { id: 'time', label: `${t('gameHub.ui.timeLeft')}: ${config.timeLimit}s`, className: 'bg-sky-50 text-sky-700' },
            ]}
          />
          <div className="rounded-[30px] border border-violet-100 bg-white p-8 shadow-xl text-center">
            <p className="mb-6 text-gray-600">{t('gameHub.memory.description')}</p>
            <p className="mb-6 rounded-2xl bg-violet-50 p-4 text-sm font-semibold text-violet-700">
              {t(facts[0]?.textKey, { defaultValue: facts[0]?.text || t('gameHub.ui.funFact') })}
            </p>
            <button onClick={init} className="rounded-lg bg-violet-600 px-8 py-3 font-semibold text-white hover:bg-violet-700">
              {t('gameHub.ui.startMemory')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <GameHeader
        theme="violet"
        eyebrow={t('gameHub.memory.title')}
        title={t('gameHub.memory.hero')}
        subtitle={`${t('gameHub.ui.gradeBand')}: ${gradeMeta.shortLabel}`}
        badges={[
          { id: 'score', label: `${t('gameHub.ui.score')}: ${state.score}`, className: 'bg-emerald-50 text-emerald-700' },
          { id: 'moves', label: `${t('gameHub.ui.moves')}: ${state.moves}`, className: 'bg-sky-50 text-sky-700' },
          { id: 'time', label: `${t('gameHub.ui.timeLeft')}: ${state.timeLeft}s`, className: 'bg-violet-50 text-violet-700' },
          { id: 'pairs', label: `${t('gameHub.ui.pairsFound')}: ${pairsFound}/${totalPairs}`, className: 'bg-amber-50 text-amber-700' },
        ]}
      />

      <div className="rounded-lg bg-[var(--s1)] p-6 shadow-lg">
        <div className="mx-auto grid max-w-2xl grid-cols-4 gap-4">
          {state.cards.map((card, index) => {
            const open = state.flipped.includes(index) || state.matched.includes(index);
            const matched = state.matched.includes(index);
            return (
              <button
                key={card.uid}
                onClick={() => flip(index)}
                disabled={open || state.done || state.flipped.length >= 2}
                className={`aspect-square rounded-lg border-2 text-3xl font-bold transition ${open ? (matched ? 'border-green-300 bg-green-100' : 'border-blue-300 bg-blue-100') : 'border-gray-300 bg-gray-100 hover:bg-gray-200'}`}
              >
                {open ? card.symbol : '?'}
              </button>
            );
          })}
        </div>
      </div>

      {state.done && (
        <div className="mt-6">
          <GameSummaryStats
            title={t('gameHub.ui.gameComplete')}
            ctaLabel={t('gameHub.ui.playAgain')}
            onCta={init}
            stats={[
              { id: 'score', label: t('gameHub.ui.score'), value: state.score + state.timeLeft * 3, className: 'bg-emerald-50 text-emerald-700' },
              { id: 'moves', label: t('gameHub.ui.moves'), value: state.moves, className: 'bg-sky-50 text-sky-700' },
              { id: 'pairs', label: t('gameHub.ui.pairsFound'), value: `${pairsFound}/${totalPairs}`, className: 'bg-violet-50 text-violet-700' },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;
