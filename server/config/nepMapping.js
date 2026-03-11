const NEP_COMPETENCIES = [
  'critical-thinking',
  'environmental-awareness',
  'scientific-temper',
  'problem-solving',
  'collaboration',
  'experiential-learning',
  'sustainable-living',
  'civic-responsibility'
];

const ACTIVITY_NEP_MAP = {
  'tree-planting': ['environmental-awareness', 'sustainable-living', 'civic-responsibility'],
  'waste-recycling': ['problem-solving', 'sustainable-living', 'environmental-awareness'],
  'water-saving': ['scientific-temper', 'environmental-awareness', 'sustainable-living'],
  'energy-saving': ['critical-thinking', 'scientific-temper', 'sustainable-living'],
  'plastic-reduction': ['problem-solving', 'environmental-awareness', 'civic-responsibility'],
  'composting': ['experiential-learning', 'scientific-temper', 'sustainable-living'],
  'biodiversity-survey': ['critical-thinking', 'experiential-learning', 'environmental-awareness']
};

const getCompetenciesForActivity = (activityType) => ACTIVITY_NEP_MAP[activityType] || [];

module.exports = {
  NEP_COMPETENCIES,
  ACTIVITY_NEP_MAP,
  getCompetenciesForActivity
};
