import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const FactCard = ({ fact, buttonLabel, onNext }) => {
  const { t } = useTranslation();

  if (!fact) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500 p-6 text-white shadow-2xl"
    >
      <div className="mb-3 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-emerald-50">
        <span className="text-2xl">🌱</span>
        <span>{t('gameHub.didYouKnow')}</span>
      </div>
      <p className="mb-5 text-lg font-semibold leading-relaxed text-white/95">
        {t(fact.textKey, { defaultValue: fact.text })}
      </p>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-black text-emerald-700 transition-transform hover:scale-[1.02]"
      >
        {buttonLabel || t('gameHub.nextLevel')}
      </button>
    </motion.div>
  );
};

export default FactCard;
