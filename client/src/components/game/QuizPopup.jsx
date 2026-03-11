import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const QuizPopup = ({ question, onComplete }) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [status, setStatus] = useState('idle');

  const isAnswered = selectedIndex !== null;

  const resultLabel = useMemo(() => {
    if (status === 'correct') {
      return t('gameHub.ui.correctReward');
    }

    if (status === 'wrong') {
      return t('gameHub.ui.correctAnswer');
    }

    return '';
  }, [status, t]);

  if (!question) {
    return null;
  }

  const handleSelect = (optionIndex) => {
    if (isAnswered) {
      return;
    }

    const isCorrect = optionIndex === question.correctIndex;
    setSelectedIndex(optionIndex);
    setStatus(isCorrect ? 'correct' : 'wrong');

    window.setTimeout(() => {
      onComplete?.({
        isCorrect,
        question,
      });
    }, 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -12 }}
      transition={{ duration: 0.2 }}
      className={`rounded-[28px] border p-6 shadow-2xl ${
        status === 'correct'
          ? 'border-emerald-300 bg-emerald-50'
          : status === 'wrong'
            ? 'border-rose-300 bg-rose-50'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        <span>🧠</span>
        <span>{t('gameHub.ui.quizCheckpoint')}</span>
      </div>
      <h3 className="mb-5 text-xl font-black leading-snug text-slate-900">
        {t(question.promptKey, { defaultValue: question.prompt })}
      </h3>
      <div className="space-y-3">
        {question.options.map((option, optionIndex) => {
          const isCorrectOption = optionIndex === question.correctIndex;
          const isSelected = selectedIndex === optionIndex;

          let optionClass = 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50';

          if (isAnswered && isCorrectOption) {
            optionClass = 'border-emerald-400 bg-emerald-100 text-emerald-900';
          } else if (isAnswered && isSelected && !isCorrectOption) {
            optionClass = 'border-rose-400 bg-rose-100 text-rose-900';
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(optionIndex)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-colors ${optionClass}`}
            >
              {t(option.textKey, { defaultValue: option.text })}
            </button>
          );
        })}
      </div>
      {status !== 'idle' && (
        <div className="mt-5 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white">
          <div className="mb-1 font-black">{resultLabel}</div>
          {status === 'correct' ? (
            <div className="text-emerald-300">+10 EcoCoins!</div>
          ) : (
            <div className="text-rose-200">
              {t('gameHub.ui.explanation')}: {t(question.explanationKey, { defaultValue: question.explanation })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default QuizPopup;