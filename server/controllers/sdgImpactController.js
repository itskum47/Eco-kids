const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const { calculateImpact } = require('../utils/impactCalculator');

/**
 * BOOST-3: SDG Coverage & UN Reporting Format
 * Real impact calculations aligned with UN SDG 2030 goals
 */

// SDG Mapping for Activities
const SDG_IMPACT_MAP = {
  'tree-planting': {
    goals: [13, 15], // Climate Action, Life on Land
    co2PerTree: 22, // kg CO2 absorbed per year
    biodiversityScore: 3
  },
  'waste-recycling': {
    goals: [12], // Responsible Consumption
    co2Reduction: 2.5, // kg per kg recycled
    resourceSaved: 0.8
  },
  'water-saving': {
    goals: [6, 12], // Clean Water, Responsible Consumption
    litersSaved: 50
  },
  'plastic-reduction': {
    goals: [12, 14], // Responsible Consumption, Life Below Water
    kgReduced: 0.5,
    marineProtection: 2
  },
  'energy-saving': {
    goals: [7, 13], // Affordable Clean Energy, Climate Action
    kwhSaved: 5,
    co2Reduction: 4
  },
  'composting': {
    goals: [12, 15], // Responsible Consumption, Life on Land
    wasteReduced: 2,
    soilHealth: 3
  },
  'biodiversity-survey': {
    goals: [15], // Life on Land
    speciesDocumented: 5,
    ecosystemAwareness: 4
  }
};

/**
 * Get SDG Impact Report (UN 2030 Format)
 * GET /api/v1/compliance/sdg-impact-report?schoolId=XXX&format=json|csv
 */
exports.getSDGImpactReport = asyncHandler(async (req, res) => {
  const { schoolId, format = 'json' } = req.query;

  const activities = await ActivitySubmission.find({
    school: schoolId,
    status: 'approved'
  })
    .select('activityType createdAt sdgGoals')
    .lean();

  // Aggregate by SDG Goal
  const sdgProgress = {
    6: { name: 'Clean Water & Sanitation', activities: 0, impact: {} },
    7: { name: 'Affordable & Clean Energy', activities: 0, impact: {} },
    12: { name: 'Responsible Consumption & Production', activities: 0, impact: {} },
    13: { name: 'Climate Action', activities: 0, impact: {} },
    14: { name: 'Life Below Water', activities: 0, impact: {} },
    15: { name: 'Life on Land', activities: 0, impact: {} }
  };

  let totalCO2Prevented = 0;
  let totalWaterSaved = 0;
  let totalPlasticReduced = 0;
  let totalEnergySaved = 0;
  let totalTreesPlanted = 0;

  activities.forEach(activity => {
    const mapping = SDG_IMPACT_MAP[activity.activityType];
    if (!mapping) return;

    mapping.goals.forEach(sdg => {
      if (sdgProgress[sdg]) {
        sdgProgress[sdg].activities++;
      }
    });

    // Calculate real impact
    switch (activity.activityType) {
      case 'tree-planting':
        totalTreesPlanted++;
        totalCO2Prevented += mapping.co2PerTree;
        break;
      case 'waste-recycling':
        totalCO2Prevented += mapping.co2Reduction;
        break;
      case 'water-saving':
        totalWaterSaved += mapping.litersSaved;
        break;
      case 'plastic-reduction':
        totalPlasticReduced += mapping.kgReduced;
        break;
      case 'energy-saving':
        totalEnergySaved += mapping.kwhSaved;
        totalCO2Prevented += mapping.co2Reduction;
        break;
      case 'composting':
        break;
      case 'biodiversity-survey':
        break;
    }
  });

  // Assign impact to SDGs
  sdgProgress[6].impact = { waterSaved: totalWaterSaved, unit: 'liters' };
  sdgProgress[7].impact = { energySaved: totalEnergySaved, unit: 'kWh' };
  sdgProgress[12].impact = { plasticReduced: totalPlasticReduced, unit: 'kg' };
  sdgProgress[13].impact = { co2Prevented: totalCO2Prevented, unit: 'kg CO2e' };
  sdgProgress[14].impact = { plasticReduced: totalPlasticReduced, unit: 'kg' };
  sdgProgress[15].impact = { treesPlanted: totalTreesPlanted, unit: 'trees' };

  if (format === 'csv') {
    const csv = generateSDGCSV(sdgProgress);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="SDG_Report_${schoolId}_${Date.now()}.csv"`);
    return res.send(csv);
  }

  res.status(200).json({
    success: true,
    data: {
      schoolId,
      reportDate: new Date().toISOString(),
      totalActivities: activities.length,
      sdgProgress,
      aggregateImpact: {
        totalCO2Prevented: `${totalCO2Prevented.toFixed(2)} kg CO2e`,
        totalWaterSaved: `${totalWaterSaved} liters`,
        totalPlasticReduced: `${totalPlasticReduced.toFixed(2)} kg`,
        totalEnergySaved: `${totalEnergySaved} kWh`,
        totalTreesPlanted: totalTreesPlanted
      },
      alignmentWith2030Targets: 'Active contribution to 6 of 17 UN SDGs',
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });
});

/**
 * Get Real-Time SDG Dashboard Data
 * GET /api/v1/compliance/sdg-dashboard?schoolId=XXX
 */
exports.getSDGDashboard = asyncHandler(async (req, res) => {
  const { schoolId } = req.query;

  const [students, activities] = await Promise.all([
    User.aggregate([
      { $match: { role: 'student', 'profile.school': mongoose.Types.ObjectId(schoolId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalCO2: { $sum: '$environmentalImpact.co2Prevented' },
          totalWater: { $sum: '$environmentalImpact.waterSaved' },
          totalPlastic: { $sum: '$environmentalImpact.plasticReduced' },
          totalTrees: { $sum: '$environmentalImpact.treesPlanted' }
        }
      }
    ]),
    ActivitySubmission.countDocuments({ school: schoolId, status: 'approved' })
  ]);

  const studentData = students[0] || {};

  res.status(200).json({
    success: true,
    data: {
      students: studentData.total || 0,
      activities,
      impact: {
        co2Prevented: (studentData.totalCO2 || 0).toFixed(2),
        waterSaved: (studentData.totalWater || 0).toFixed(2),
        plasticReduced: (studentData.totalPlastic || 0).toFixed(2),
        treesPlanted: studentData.totalTrees || 0
      },
      sdgProgress: [
        { goal: 6, name: 'Clean Water', progress: Math.min(100, ((studentData.totalWater || 0) / 10000) * 100) },
        { goal: 13, name: 'Climate Action', progress: Math.min(100, ((studentData.totalCO2 || 0) / 5000) * 100) },
        { goal: 15, name: 'Life on Land', progress: Math.min(100, ((studentData.totalTrees || 0) / 500) * 100) }
      ]
    }
  });
});

// Helper: Generate CSV for SDG report
function generateSDGCSV(sdgProgress) {
  let csv = 'SDG Goal,Goal Name,Activities,Impact Metric,Impact Value,Unit\n';

  Object.entries(sdgProgress).forEach(([goal, data]) => {
    const impactKeys = Object.keys(data.impact);
    if (impactKeys.length > 0) {
      impactKeys.forEach(key => {
        if (key !== 'unit') {
          csv += `${goal},"${data.name}",${data.activities},${key.replace(/([A-Z])/g, ' $1').trim()},${data.impact[key]},${data.impact.unit}\n`;
        }
      });
    } else {
      csv += `${goal},"${data.name}",${data.activities},N/A,0,N/A\n`;
    }
  });

  return csv;
}

module.exports = {
  getSDGImpactReport: exports.getSDGImpactReport,
  getSDGDashboard: exports.getSDGDashboard,
  SDG_IMPACT_MAP
};
