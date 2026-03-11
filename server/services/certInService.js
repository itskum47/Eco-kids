const crypto = require('crypto');
const { logAuditEvent } = require('../utils/auditLogger');

const CERT_IN_SEVERITY = ['low', 'medium', 'high', 'critical'];

const createCertInIncidentReport = async ({ req, actorId, actorRole, incidentType, severity, summary, evidence }) => {
  if (!CERT_IN_SEVERITY.includes(severity)) {
    throw new Error('Invalid severity level');
  }

  const incidentId = `CERTIN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const payload = {
    incidentId,
    incidentType,
    severity,
    summary,
    evidence: evidence || {},
    reportedAt: new Date().toISOString(),
    source: 'EcoKids India Platform',
    certInContact: process.env.CERT_IN_CONTACT_EMAIL || 'security@ecokids.in'
  };

  await logAuditEvent({
    actorId: actorId.toString(),
    actorRole,
    action: 'CERT_IN_INCIDENT_REPORTED',
    targetType: 'SYSTEM',
    targetId: incidentId,
    metadata: payload,
    req,
    status: 'success',
    complianceFlags: ['CERT_IN', 'ISO_27001']
  }).catch(() => {});

  return payload;
};

module.exports = {
  createCertInIncidentReport,
  CERT_IN_SEVERITY
};
