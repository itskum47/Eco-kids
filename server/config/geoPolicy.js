/**
 * GEO_POLICY — per-activity geo-fencing rules.
 *
 * maxDistanceMeters: how far from the school coordinates is acceptable.
 *   Set to null to skip school-proximity check entirely for that type.
 * requiresGeo: if true, GPS coords are mandatory. If false, GPS is optional
 *   and missing coords won't block submission.
 *
 * WHY: A flat 5 km school-proximity radius incorrectly flagged legitimate
 * outdoor activities (river cleanups, nature walks, urban planting drives).
 * Each activity type needs its own policy.
 */
const GEO_POLICY = {
  'tree-planting':             { maxDistanceMeters: 50_000,  requiresGeo: false },
  'urban-tree-planting':       { maxDistanceMeters: 30_000,  requiresGeo: false },
  'waste-segregation':         { maxDistanceMeters: 5_000,   requiresGeo: true  },
  'water-conservation':        { maxDistanceMeters: 5_000,   requiresGeo: true  },
  'energy-saving':             { maxDistanceMeters: 5_000,   requiresGeo: true  },
  'composting':                { maxDistanceMeters: 10_000,  requiresGeo: false },
  'nature-walk':               { maxDistanceMeters: 200_000, requiresGeo: false },
  'quiz-completion':           { maxDistanceMeters: null,    requiresGeo: false },
  'stubble-management':        { maxDistanceMeters: 100_000, requiresGeo: false },
  'sutlej-cleanup':            { maxDistanceMeters: 300_000, requiresGeo: false },
  'groundwater-conservation':  { maxDistanceMeters: 50_000,  requiresGeo: false },
  'air-quality-monitoring':    { maxDistanceMeters: 50_000,  requiresGeo: false },
  'research-track':            { maxDistanceMeters: null,    requiresGeo: false },
};

/** Default fallback for any unknown activity type */
const DEFAULT_GEO_POLICY = { maxDistanceMeters: 10_000, requiresGeo: false };

/**
 * Get the geo policy for a given activity type.
 * @param {string} activityType
 * @returns {{ maxDistanceMeters: number|null, requiresGeo: boolean }}
 */
function getGeoPolicy(activityType) {
  return GEO_POLICY[activityType] || DEFAULT_GEO_POLICY;
}

module.exports = { GEO_POLICY, getGeoPolicy };
