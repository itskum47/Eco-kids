/**
 * Environmental Impact Calculator
 * Calculates measurable environmental metrics based on activity type and data
 */

/**
 * Calculate environmental impact based on activity type
 * @param {string} activityType - Type of environmental activity
 * @param {object} activityData - Additional data for calculation
 * @returns {object} Impact metrics object with incremental values
 */
const calculateImpact = (activityType, activityData = {}) => {
  const impact = {
    treesPlanted: 0,
    co2Prevented: 0,
    waterSaved: 0,
    plasticReduced: 0,
    energySaved: 0,
    activitiesCompleted: 1
  };

  switch (activityType) {
    case 'tree-planting':
      // 1 tree planted
      impact.treesPlanted = 1;
      // Average tree absorbs ~20kg CO2 per year
      impact.co2Prevented = 20;
      break;

    case 'waste-recycling':
      // Calculate based on weight of waste properly segregated/recycled
      if (activityData.weightKg) {
        // Each kg of waste properly recycled saves ~0.5kg CO2 vs landfill
        impact.plasticReduced = activityData.weightKg;
        impact.co2Prevented = activityData.weightKg * 0.5;
      } else {
        // Default: 1kg if not specified
        impact.plasticReduced = 1;
        impact.co2Prevented = 0.5;
      }
      break;

    case 'water-saving':
      // Calculate based on water saved in litres
      if (activityData.litresSaved) {
        impact.waterSaved = activityData.litresSaved;
        // Water treatment and transport saves ~0.002kg CO2 per litre
        impact.co2Prevented = activityData.litresSaved * 0.002;
      } else {
        // Default: 100L if not specified
        impact.waterSaved = 100;
        impact.co2Prevented = 0.2;
      }
      break;

    case 'energy-saving':
      // Calculate based on kWh saved
      if (activityData.kwhSaved) {
        impact.energySaved = activityData.kwhSaved;
        // Avg grid electricity saves ~0.7kg CO2 per kWh (varies by region)
        impact.co2Prevented = activityData.kwhSaved * 0.7;
      } else {
        // Default: 1kWh if not specified
        impact.energySaved = 1;
        impact.co2Prevented = 0.7;
      }
      break;

    case 'biodiversity-survey':
      // Biodiversity documentation - conservation activity
      impact.co2Prevented = 0.2; // Habitat awareness
      break;

    case 'plastic-reduction':
      // Avoiding single-use plastics (same as waste-recycling)
      if (activityData.weightKg) {
        impact.plasticReduced = activityData.weightKg;
        impact.co2Prevented = activityData.weightKg * 0.5;
      } else {
        impact.plasticReduced = 1;
        impact.co2Prevented = 0.5;
      }
      break;

    case 'composting':
      impact.plasticReduced = 0.5;
      impact.co2Prevented = 0.3;
      break;

    default:
      // Unknown activity type - log it so we can add calibration
      console.warn(`[ImpactCalculator] Uncalibrated category: "${activityType}" — using fallback 0.01kg CO2`);
      impact.co2Prevented = 0.01;
  }

  return impact;
};

/**
 * Calculate real-world equivalents for visualization
 * @param {object} environmentalImpact - User's total environmental impact
 * @returns {object} Real-world equivalents
 */
const calculateEquivalents = (environmentalImpact) => {
  return {
    // CO2 equivalents
    equivalentCarsOffRoad: Math.round(
      (environmentalImpact.co2Prevented / 4600) * 100
    ) / 100, // Avg car emits 4600kg CO2/year
    equivalentHousesHeatedWithRenewable: Math.round(
      (environmentalImpact.co2Prevented / 3300) * 100
    ) / 100, // Avg house emits 3300kg CO2/year
    equivalentAirflightsAvoided: Math.round(
      (environmentalImpact.co2Prevented / 285) * 100
    ) / 100, // Round trip flight~285kg CO2

    // Trees equivalents
    equivalentTreesGrown: environmentalImpact.treesPlanted,
    equivalentTreesNeededToOffset:
      Math.round(
        (environmentalImpact.co2Prevented / 20) * 100
      ) / 100, // 1 tree absorbs 20kg CO2/year

    // Water equivalents
    equivalentOlympicSwimmingPools: Math.round(
      (environmentalImpact.waterSaved / 2500000) * 1000000
    ) / 1000000, // Olympic pool = 2.5M litres
    equivalentShowersAvoided: Math.round(
      (environmentalImpact.waterSaved / 95) * 100
    ) / 100, // Avg shower = 95L

    // Plastic equivalents
    equivalentPlasticBottlesAvoided: Math.round(
      (environmentalImpact.plasticReduced / 0.025) * 100
    ) / 100, // Avg bottle = 25g
    equivalentPlasticBagsAvoided: Math.round(
      (environmentalImpact.plasticReduced / 0.005) * 100
    ) / 100, // Avg bag = 5g

    // Energy equivalents
    equivalentHouseholdsDayEnergy: Math.round(
      (environmentalImpact.energySaved / 30) * 100
    ) / 100 // Avg household uses 30kWh/day
  };
};

module.exports = {
  calculateImpact,
  calculateEquivalents
};
