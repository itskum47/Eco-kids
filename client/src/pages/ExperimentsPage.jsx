import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../utils/api';

const USE_HARDCODED = true;

const GRADE_BANDS = [
  { id: 'all', label: 'All' },
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  { id: '5', label: '5' },
  { id: '6', label: '6' },
  { id: '7', label: '7' },
  { id: '8', label: '8' },
  { id: '9', label: '9' },
  { id: '10', label: '10' },
  { id: '11', label: '11' },
  { id: '12', label: '12' },
];

const EXPERIMENTS = [
  {
    id: 1,
    title: "Seed Sprouting Race",
    titleHi: "बीज अंकुरण दौड़",
    emoji: "🌱",
    gradeMin: 1, gradeMax: 3,
    safety: "solo",
    timeRequired: "7 days observation",
    ecoPointsReward: 30,
    gradient: "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
    materials: ["3 small pots", "Soil", "9 seeds", "Water", "Labels"],
    materialsHi: ["3 छोटे गमले", "मिट्टी", "9 बीज", "पानी", "लेबल"],
    preview: "Plant seeds in 3 pots — one with sunlight, one without water, one in the dark. Which grows?",
    previewHi: "3 गमलों में बीज लगाओ — एक धूप में, एक बिना पानी, एक अंधेरे में। कौन उगेगा?",
    steps: [
      "Fill 3 pots with soil equally",
      "Plant 3 seeds in each pot, 1cm deep",
      "Label: 'Sunlight', 'No Water', 'Dark'",
      "Place Sunlight pot near window, water daily",
      "Place No Water pot near window, no water",
      "Put Dark pot in a cupboard, water daily",
      "Observe and draw what you see each day for 7 days",
      "Compare results — which seeds grew and why?"
    ]
  },
  {
    id: 2,
    title: "Natural Water Filter",
    titleHi: "प्राकृतिक जल फ़िल्टर",
    emoji: "💧",
    gradeMin: 4, gradeMax: 6,
    safety: "buddy",
    timeRequired: "45 minutes",
    ecoPointsReward: 45,
    gradient: "linear-gradient(135deg,#e1f5fe,#b3e5fc)",
    materials: ["Plastic bottle (cut in half)", "Sand", "Gravel", "Cotton", "Muddy water"],
    materialsHi: ["प्लास्टिक बोतल (आधी काटी हुई)", "रेत", "बजरी", "कॉटन", "गंदा पानी"],
    preview: "Build a filter using sand, gravel and cotton. Watch muddy water become clear!",
    previewHi: "रेत, बजरी और कॉटन से फ़िल्टर बनाओ। गंदा पानी साफ़ होते देखो!",
    steps: [
      "Cut plastic bottle in half",
      "Place cotton at the bottom of the top half (the funnel)",
      "Add a layer of fine sand (5cm)",
      "Add a layer of gravel (5cm)",
      "Pour muddy water slowly through the filter",
      "Collect filtered water in the bottom half",
      "Compare the before and after water",
      "Note: this removes particles but not bacteria — real filters do more!"
    ]
  },
  {
    id: 3,
    title: "Air Pollution Detector",
    titleHi: "वायु प्रदूषण डिटेक्टर",
    emoji: "🏭",
    gradeMin: 4, gradeMax: 7,
    safety: "solo",
    timeRequired: "3 days",
    ecoPointsReward: 40,
    gradient: "linear-gradient(135deg,#fff8e1,#fff3e0)",
    materials: ["White card paper (4 pieces)", "Vaseline", "Magnifying glass", "Pen"],
    materialsHi: ["सफ़ेद कार्ड पेपर", "वैसलीन", "आवर्धक लेंस", "पेन"],
    preview: "Coat white cards with Vaseline, place in different locations. See which collects most dust!",
    previewHi: "सफ़ेद कार्ड पर वैसलीन लगाओ, अलग-अलग जगह रखो। देखो कहाँ सबसे ज़्यादा धूल इकट्ठा होती है!",
    steps: [
      "Cut 4 equal pieces of white card paper",
      "Coat each one with a thin layer of Vaseline",
      "Label them: Near road, Garden, Indoor, Balcony",
      "Place each card at its labelled location",
      "Leave for 3 days — do not disturb",
      "Collect all cards and use magnifying glass to examine dust",
      "Record your observations in a table",
      "Which location had the most pollution? Why?"
    ]
  },
  {
    id: 4,
    title: "Kitchen Compost Jar",
    titleHi: "रसोई कम्पोस्ट जार",
    emoji: "🥬",
    gradeMin: 5, gradeMax: 8,
    safety: "buddy",
    timeRequired: "21 days",
    ecoPointsReward: 60,
    gradient: "linear-gradient(135deg,#e8f5e9,#dcedc8)",
    materials: ["Large glass jar", "Kitchen scraps", "Dry leaves", "Soil", "Water spray"],
    materialsHi: ["बड़ा शीशे का जार", "रसोई के टुकड़े", "सूखे पत्ते", "मिट्टी", "पानी की बोतल"],
    preview: "Turn kitchen waste into rich compost in just 3 weeks using a simple jar.",
    previewHi: "एक साधारण जार का उपयोग करके 3 हफ्तों में रसोई के कचरे को खाद में बदलो।",
    steps: [
      "Collect vegetable peels, fruit scraps, tea leaves (no meat or dairy)",
      "Add a layer of dry leaves at the bottom of jar",
      "Add a layer of kitchen scraps",
      "Add a thin layer of soil",
      "Spray lightly with water",
      "Repeat layers until jar is full",
      "Close lid loosely (needs some air)",
      "Stir gently every 2-3 days for 3 weeks",
      "After 3 weeks: dark crumbly compost is ready to use in your garden!"
    ]
  },
  {
    id: 5,
    title: "Solar Water Heater",
    titleHi: "सौर जल ऊष्मक",
    emoji: "☀️",
    gradeMin: 7, gradeMax: 9,
    safety: "adult",
    timeRequired: "2 hours",
    ecoPointsReward: 75,
    gradient: "linear-gradient(135deg,#fff9c4,#fff8e1)",
    materials: ["Black plastic pipe", "Cardboard", "Aluminium foil", "Thermometer", "Water"],
    materialsHi: ["काला प्लास्टिक पाइप", "गत्ता", "एल्युमिनियम फ़ॉइल", "थर्मामीटर", "पानी"],
    preview: "Build a mini solar water heater and measure how much temperature rises in sunlight.",
    previewHi: "एक मिनी सौर जल ऊष्मक बनाओ और मापो कि धूप में तापमान कितना बढ़ता है।",
    steps: [
      "Cover cardboard with aluminium foil (shiny side up) — this is your reflector",
      "Coil the black pipe on top of the reflector",
      "Secure pipe ends so water can flow in and out",
      "Fill pipe with cold water, measure inlet temperature",
      "Place the device in direct sunlight for 1 hour",
      "Measure outlet water temperature",
      "Calculate temperature rise",
      "Compare with control: same pipe in shade",
      "Calculate: how much energy did the sun provide?"
    ]
  },
  {
    id: 6,
    title: "Household Carbon Audit",
    titleHi: "घरेलू कार्बन ऑडिट",
    emoji: "📊",
    gradeMin: 10, gradeMax: 12,
    safety: "solo",
    timeRequired: "1 week research",
    ecoPointsReward: 100,
    gradient: "linear-gradient(135deg,#e0f2f1,#b2dfdb)",
    materials: ["Electricity bills", "Calculator", "Notebook", "Internet access"],
    materialsHi: ["बिजली के बिल", "कैलकुलेटर", "नोटबुक", "इंटरनेट"],
    preview: "Calculate your household's annual carbon footprint and create a reduction plan.",
    previewHi: "अपने घर का सालाना कार्बन फुटप्रिंट गणना करो और एक कमी योजना बनाओ।",
    steps: [
      "Collect electricity bills for last 3 months and calculate average monthly units",
      "Multiply by 0.82 kg CO₂ per unit (India grid factor) = electricity emissions",
      "Note how many LPG cylinders your family uses per month × 12 = annual cylinders",
      "Multiply cylinders × 14.2 kg CO₂ = cooking emissions",
      "List all vehicles: note fuel type and monthly km",
      "Petrol: km ÷ 15 × 2.31 kg CO₂/litre = transport emissions",
      "Add all three categories for total annual household CO₂",
      "Compare to India average (1.9 tonnes/person/year)",
      "Identify top 3 changes your family could make to reduce emissions",
      "Present findings to your family — can you reduce by 10% this year?"
    ]
  },
];

function ExperimentCard({ exp, t, i18n, onSelect }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div
        onClick={() => onSelect(exp)}
        className="block bg-white rounded-2xl border-2 border-[#e8f5e9] shadow-sm overflow-hidden hover:border-[#a5d6a7] hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row h-full">
          {/* Left: emoji + gradient */}
          <div className="w-full sm:w-32 sm:flex-shrink-0 flex items-center justify-center text-6xl py-8 sm:py-0" style={{ background: exp.gradient }}>
            {exp.emoji}
          </div>

          {/* Right: content */}
          <div className="flex-1 p-5 flex flex-col justify-between bg-white">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold text-[#2e7d32] bg-[#e8f5e9] border border-[#a5d6a7] px-2.5 py-1 rounded-full">
                  {t('grades.class')} {exp.gradeMin}–{exp.gradeMax}
                </span>

                {/* Safety badge */}
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border
                  ${exp.safety === 'solo'
                    ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
                    : exp.safety === 'buddy'
                      ? 'bg-[#fff8e1] text-[#e65100] border-[#ffe082]'
                      : 'bg-[#fce4ec] text-[#880e4f] border-[#f48fb1]'
                  }`}>
                  {exp.safety === 'solo' ? '🟢 ' : exp.safety === 'buddy' ? '🟡 ' : '🔴 '}
                  {t(`experiments.safety_${exp.safety}`, { defaultValue: exp.safety === 'solo' ? 'Solo OK' : exp.safety === 'buddy' ? 'With Buddy' : 'Adult Needed' })}
                </span>

                <span className="text-xs text-[#7a9b72]">
                  🕐 {exp.timeRequired || `${exp.estimatedTimeMinutes} min`}
                </span>

                <span className="text-xs font-mono font-bold text-[#f59e0b] ml-auto">
                  +{exp.ecoPointsReward} EP
                </span>
              </div>

              <h3 className="font-ui font-bold text-[17px] text-[#1a2e1c] mb-1.5 leading-snug">
                {i18n.language === 'hi' && exp.titleHi ? exp.titleHi : exp.title}
              </h3>

              <p className="text-[13px] text-[#4a6741] line-clamp-2 mb-4 leading-relaxed">
                {i18n.language === 'hi' && exp.previewHi ? exp.previewHi : (exp.preview || exp.description || '')}
              </p>

              {/* Materials chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(i18n.language === 'hi' && exp.materialsHi ? exp.materialsHi : (exp.materials || [])).slice(0, 4).map(m => (
                  <span key={m} className="text-[10px] uppercase tracking-wider font-bold bg-[#f9fffe] border border-[#c8e6c9] text-[#2e7d32] px-2 py-0.5 rounded-md">
                    {m}
                  </span>
                ))}
                {(exp.materials || []).length > 4 && (
                  <span className="text-[10px] uppercase font-bold text-[#7a9b72] px-1 py-0.5">
                    +{exp.materials.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onSelect(exp); }}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#2e7d32] text-white font-bold text-sm rounded-xl hover:bg-[#1b5e20] transition-colors self-end uppercase tracking-widest cursor-pointer mt-2"
            >
              {t('experiments.startExperiment', { defaultValue: 'Start Experiment' })} →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperimentsPage() {
  const [apiExperiments, setApiExperiments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGrade, setActiveGrade] = useState('all');
  const [activeSafety, setActiveSafety] = useState('all');
  const [selected, setSelected] = useState(null);
  const { t, i18n } = useTranslation();

  const experiments = USE_HARDCODED ? EXPERIMENTS : (apiExperiments || []);

  const safetyFilters = [
    { id: 'all', label: t('category.all', { defaultValue: 'All' }), emoji: '🔬' },
    { id: 'solo', label: t('experiments.safety_solo', { defaultValue: 'Solo OK' }), emoji: '🟢' },
    { id: 'buddy', label: t('experiments.safety_buddy', { defaultValue: 'With Buddy' }), emoji: '🟡' },
    { id: 'adult', label: t('experiments.safety_adult', { defaultValue: 'Adult Required' }), emoji: '🔴' }
  ];

  useEffect(() => {
    if (!USE_HARDCODED) {
      apiRequest('/experiments')
        .then(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            setApiExperiments(data);
          } else {
            setApiExperiments(EXPERIMENTS);
          }
        })
        .catch(() => setApiExperiments(EXPERIMENTS))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filtered = experiments.filter(e => {
    const gradeOk = activeGrade === 'all' || (Number(activeGrade) >= e.gradeMin && Number(activeGrade) <= e.gradeMax);
    const safetyOk = activeSafety === 'all' || e.safety === activeSafety;
    return gradeOk && safetyOk;
  });

  return (
    <div className="min-h-screen bg-[#f9fffe]">
      <Navbar />

      {/* Page Header */}
      <div className="pt-28 pb-6 text-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, justifyContent: 'center' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#e8f5e9', border: '1px solid #a5d6a7',
              color: '#1b5e20', padding: '6px 14px', borderRadius: 100,
              fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}>
            ← Back
          </button>
          <span style={{ fontSize: 12, color: '#7a9b72' }}>Home / Experiments</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-[#1b5e20] mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
          🔬 {t('experiments.title', { defaultValue: 'Experiments' })}
        </h1>
        <p className="text-lg text-[#4a6741] max-w-xl mx-auto px-4">
          {t('experiments.subtitle', { defaultValue: 'Real-world science labs for your grade. Try these out!' })}
        </p>
      </div>

      <div className="max-w-[1020px] mx-auto px-4 sm:px-6 pb-24">

        {/* Grade filter pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {GRADE_BANDS.map(gr => (
            <button
              key={gr.id}
              onClick={() => setActiveGrade(gr.id)}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all border
                ${activeGrade === gr.id
                  ? 'bg-[#2e7d32] border-[#2e7d32] text-white shadow-md'
                  : 'bg-white border-[#c8e6c9] text-[#2e7d32] hover:border-[#81c784]'}`}
            >
              {gr.id === 'all' ? t('grades.all', { defaultValue: 'All' }) : `${t('grades.class', { defaultValue: 'Class' })} ${gr.label}`}
            </button>
          ))}
        </div>

        {/* Safety filter */}
        <div className="flex flex-wrap gap-2 justify-center mt-4 mb-10">
          {safetyFilters.map(sf => (
            <button
              key={sf.id}
              onClick={() => setActiveSafety(sf.id)}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 border
                ${activeSafety === sf.id
                  ? 'bg-[#2e7d32] border-[#2e7d32] text-white shadow-md'
                  : 'bg-white border-[#c8e6c9] text-[#2e7d32] hover:border-[#81c784]'}`}
            >
              <span>{sf.emoji}</span>
              <span>{sf.label}</span>
            </button>
          ))}
        </div>

        {/* Experiments List */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl bg-[#e8f5e9] h-48 animate-pulse border-2 border-[#c8e6c9]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔬</div>
            <p className="text-[#4a6741] text-xl font-bold">{t('topics.noTopics', { defaultValue: 'No experiments found.' })}</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filtered.map(exp => (
                <ExperimentCard key={exp.id || exp._id} exp={exp} t={t} i18n={i18n} onSelect={setSelected} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Details Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
            zIndex: 1000, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', padding: '32px 16px', overflowY: 'auto'
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 24, maxWidth: 800,
              width: '100%', overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,.3)', marginBottom: 40
            }}>

            {/* Header */}
            <div style={{
              background: selected.gradient || '#e8f5e9',
              padding: '32px 40px 24px', position: 'relative'
            }}>
              <button onClick={() => setSelected(null)} style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(0,0,0,.15)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                fontSize: 18, cursor: 'pointer', color: 'white'
              }}>✕</button>
              <div style={{ fontSize: 72, marginBottom: 16 }}>{selected.emoji}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, padding: '4px 14px',
                  borderRadius: 100, background: '#e8f5e9',
                  border: '1px solid #a5d6a7', color: '#1b5e20'
                }}>
                  Class {selected.gradeMin}–{selected.gradeMax}
                </span>

                <span style={{
                  fontSize: 13, fontWeight: 700, padding: '4px 14px',
                  borderRadius: 100,
                  background: selected.safety === 'solo' ? '#e8f5e9'
                    : selected.safety === 'buddy' ? '#fff8e1' : '#fce4ec',
                  color: selected.safety === 'solo' ? '#1b5e20'
                    : selected.safety === 'buddy' ? '#e65100' : '#880e4f',
                  border: '1px solid #c8e6c9'
                }}>
                  {selected.safety === 'solo' ? '🟢 ' : selected.safety === 'buddy' ? '🟡 ' : '🔴 '}
                  {t(`experiments.safety_${selected.safety}`, { defaultValue: selected.safety })}
                </span>

                <span style={{ fontSize: 13, color: '#7a9b72', display: 'flex', alignItems: 'center' }}>
                  🕐 {selected.timeRequired || `${selected.estimatedTimeMinutes} min`}
                </span>

                <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center' }}>
                  +{selected.ecoPointsReward} EP
                </span>
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1b5e20', margin: 0, fontFamily: "'Instrument Serif', serif" }}>
                {i18n.language === 'hi' && selected.titleHi ? selected.titleHi : selected.title}
              </h2>
            </div>

            {/* Description */}
            <div style={{ padding: '32px 40px' }}>
              <p style={{ fontSize: 16, color: '#4a6741', lineHeight: 1.7, marginBottom: 24 }}>
                {i18n.language === 'hi' && selected.previewHi ? selected.previewHi : (selected.preview || selected.description || '')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Materials list */}
                <div className="md:col-span-1 bg-[#f9fffe] rounded-xl p-5 border border-[#e8f5e9]">
                  <h4 className="font-bold text-[#1b5e20] mb-3 border-b border-[#e8f5e9] pb-2">📋 Materials Needed</h4>
                  <ul className="space-y-2">
                    {(i18n.language === 'hi' && selected.materialsHi ? selected.materialsHi : (selected.materials || [])).map((material, idx) => (
                      <li key={idx} className="text-sm text-[#4a6741] flex items-start">
                        <span className="text-[#a5d6a7] mr-2">•</span> {material}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Steps List */}
                <div className="md:col-span-2 bg-[#f9fffe] rounded-xl p-5 border border-[#e8f5e9]">
                  <h4 className="font-bold text-[#1b5e20] mb-3 border-b border-[#e8f5e9] pb-2">🚀 Step by Step</h4>
                  <ol className="space-y-3">
                    {(i18n.language === 'hi' && selected.stepsHi ? selected.stepsHi : (selected.steps || [])).map((step, idx) => (
                      <li key={idx} className="text-sm text-[#4a6741] flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold flex items-center justify-center mr-3 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>


              <div className="flex gap-4">
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    flex: '1', padding: '14px 0',
                    background: '#2e7d32', color: 'white',
                    border: 'none', borderRadius: 100,
                    fontWeight: 900, fontSize: 16, cursor: 'pointer',
                    letterSpacing: '.04em'
                  }}>
                  {t('experiments.startExperiment', { defaultValue: 'Start Experiment' })}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    padding: '14px 24px',
                    background: 'transparent', color: '#7a9b72',
                    border: '2px solid #c8e6c9', borderRadius: 100,
                    fontWeight: 700, fontSize: 16, cursor: 'pointer'
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}