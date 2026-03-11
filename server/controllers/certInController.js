const { createCertInIncidentReport } = require('../services/certInService');

// @desc    Report security incident for CERT-In workflow
// @route   POST /api/v1/certin/incidents
// @access  Private (district_admin, state_admin)
exports.reportIncident = async (req, res, next) => {
  try {
    const { incidentType, severity, summary, evidence } = req.body;

    const report = await createCertInIncidentReport({
      req,
      actorId: req.user._id,
      actorRole: req.user.role,
      incidentType,
      severity,
      summary,
      evidence
    });

    return res.status(201).json({
      success: true,
      message: 'Incident logged for CERT-In process',
      data: report
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get CERT-In readiness status
// @route   GET /api/v1/certin/readiness
// @access  Private (district_admin, state_admin)
exports.getReadinessStatus = async (req, res) => {
  const readiness = {
    securityHeaders: true,
    auditLoggingEnabled: true,
    incidentWorkflowEnabled: true,
    rateLimitingEnabled: true,
    dataResidencyGuardEnabled: process.env.ENFORCE_INDIA_DATA_RESIDENCY === 'true'
  };

  const score = Math.round((Object.values(readiness).filter(Boolean).length / Object.keys(readiness).length) * 100);

  return res.status(200).json({
    success: true,
    data: {
      readiness,
      certInReadinessScore: score,
      contact: process.env.CERT_IN_CONTACT_EMAIL || 'security@ecokids.in'
    }
  });
};
