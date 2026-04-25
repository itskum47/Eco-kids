/**
 * SubmissionCelebration.jsx
 *
 * Full-screen celebration overlay triggered on:
 *  a) Immediate online submit (instant optimistic reward)
 *  b) Socket "points-earned" event (AI worker approved)
 */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function SubmissionCelebration({
  points = 50,
  activityLabel = 'Eco Activity',
  verified = false,   // true = AI already confirmed; false = submitted, pending
  onDone
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.45 },
      colors: ['#22c55e', '#16a34a', '#86efac', '#fbbf24', '#34d399', '#6ee7b7'],
      zIndex: 9999,
    });

    setTimeout(() => {
      confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.55 }, colors: ['#4ade80', '#facc15', '#a3e635'], zIndex: 9999 });
      confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.55 }, colors: ['#4ade80', '#facc15', '#a3e635'], zIndex: 9999 });
    }, 300);

    const t = setTimeout(onDone, 3800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-[9998]"
      style={{ pointerEvents: 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-4 bg-white rounded-3xl shadow-2xl px-10 py-8 mx-4 max-w-sm w-full"
        initial={{ scale: 0.55, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      >
        {/* Big emoji */}
        <motion.div
          className="text-6xl select-none"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.08 }}
        >
          {verified ? '🏆' : '🌿'}
        </motion.div>

        {/* Points */}
        <motion.div
          className="flex items-baseline gap-1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <motion.span
            className="text-5xl font-extrabold text-green-500 tabular-nums"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.22 }}
          >
            +{points}
          </motion.span>
          <span className="text-xl font-semibold text-green-600">Eco Points</span>
        </motion.div>

        {/* Activity label */}
        <motion.p
          className="text-gray-500 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          for <span className="font-bold text-gray-800">{activityLabel}</span>
        </motion.p>

        {/* Status badge */}
        <motion.div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 ${
            verified
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <motion.span
            className={`w-2.5 h-2.5 rounded-full ${verified ? 'bg-green-500' : 'bg-amber-400'}`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
          />
          <span className={`text-xs font-bold tracking-wide uppercase ${verified ? 'text-green-700' : 'text-amber-700'}`}>
            {verified ? 'AI Verified ✓' : 'Submitted — AI Verifying…'}
          </span>
        </motion.div>

        {/* Sub-note */}
        <motion.p
          className="text-xs text-gray-400 text-center leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {verified
            ? 'Great work! Points added to your leaderboard rank.'
            : 'Our AI checks your photo like a teacher — results in seconds.'}
        </motion.p>

        {/* Auto-dismiss bar */}
        <motion.div
          className="w-full h-1 bg-gray-100 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <motion.div
            className="h-full bg-green-400 rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3.8, ease: [0.25, 0, 0.75, 1] }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

