const ACTIVITY_SDG_MAP = {
  'tree-planting': [13, 15],
  'waste-recycling': [12],
  'water-saving': [6],
  'energy-saving': [7, 13],
  'plastic-reduction': [12, 14],
  'composting': [12, 15],
  'biodiversity-survey': [15]
};

const SDG_METADATA = {
  4: { title: 'Quality Education', color: '#c5192d' },
  6: { title: 'Clean Water and Sanitation', color: '#26bde2' },
  7: { title: 'Affordable and Clean Energy', color: '#fcc30b' },
  12: { title: 'Responsible Consumption and Production', color: '#bf8b2e' },
  13: { title: 'Climate Action', color: '#3f7e44' },
  14: { title: 'Life Below Water', color: '#0a97d9' },
  15: { title: 'Life on Land', color: '#56c02b' }
};

const getSdgsForActivity = (activityType) => ACTIVITY_SDG_MAP[activityType] || [];

module.exports = {
  ACTIVITY_SDG_MAP,
  SDG_METADATA,
  getSdgsForActivity
};
