import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    title: 'Welcome to EcoKids 🌱',
    body: 'Learn, act, and track your real-world environmental impact every day.',
    mascot: '🦜'
  },
  {
    title: 'Earn Eco-Points',
    body: 'Complete activities, quizzes, and challenges to level up and unlock badges.',
    actions: ['Submit eco activity (+points)', 'Complete daily challenge (+50)', 'Maintain your streak (+bonus)']
  },
  {
    title: 'Your First Challenge',
    body: 'Start with today\'s daily challenge and collect your first reward.',
    challengeLink: '/dashboard'
  },
  {
    title: 'Set Your School',
    body: 'Search and confirm your school so your impact appears in school leaderboards.',
    showSchoolSearch: true
  }
];

export default function Onboarding({ isOpen, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [schoolQuery, setSchoolQuery] = useState('');

  const step = useMemo(() => steps[stepIndex], [stepIndex]);

  const finish = () => {
    localStorage.setItem('ecokids_onboarding_complete', 'true');
    onComplete();
  };

  const next = () => {
    if (stepIndex === steps.length - 1) {
      finish();
      return;
    }
    setStepIndex((value) => value + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          className="w-full max-w-lg bg-[#f9fffe] border border-[#d8edd9] rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold tracking-widest uppercase text-[#2e7d32]">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <button
              onClick={finish}
              className="text-sm font-semibold text-[#2e7d32] hover:text-[#1b5e20]"
            >
              Skip
            </button>
          </div>

          <h2 className="text-2xl font-black text-[#0a1e0a] mb-3">{step.title}</h2>
          <p className="text-[#1a3a1a] mb-5">{step.body}</p>

          {step.mascot && (
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="text-6xl text-center mb-4"
            >
              {step.mascot}
            </motion.div>
          )}

          {step.actions && (
            <ul className="space-y-2 mb-5">
              {step.actions.map((item) => (
                <li key={item} className="text-sm bg-white border border-[#e3f1e3] rounded-lg px-3 py-2 text-[#145214]">
                  • {item}
                </li>
              ))}
            </ul>
          )}

          {step.challengeLink && (
            <Link
              to={step.challengeLink}
              className="inline-flex mb-5 items-center gap-2 bg-[#2e7d32] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#1b5e20]"
            >
              Open Daily Challenge →
            </Link>
          )}

          {step.showSchoolSearch && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#145214] mb-2">School search</label>
              <input
                value={schoolQuery}
                onChange={(event) => setSchoolQuery(event.target.value)}
                placeholder="Type your school name"
                className="w-full border border-[#b7dfb9] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={finish}
              className="px-4 py-2 rounded-lg border border-[#b7dfb9] text-[#145214] font-semibold"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="px-5 py-2 rounded-lg bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold"
            >
              {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
