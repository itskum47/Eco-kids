const School = require('../models/School');
const { verifySchoolByUdise } = require('../services/udiseService');
const { logAuditEvent } = require('../utils/auditLogger');

const resolveSchoolForUser = async (req, schoolId) => {
  if (schoolId) {
    return School.findById(schoolId);
  }

  if (req.user.role === 'school_admin') {
    if (req.user.profile?.schoolId) {
      return School.findById(req.user.profile.schoolId);
    }

    if (req.user.profile?.school) {
      return School.findOne({ name: req.user.profile.school });
    }
  }

  return null;
};

// @desc    Verify UDISE code against UDISE/local registry
// @route   GET /api/v1/udise/verify/:udiseCode
// @access  Private (school_admin, district_admin, state_admin)
exports.verifyUdiseCode = async (req, res, next) => {
  try {
    const { udiseCode } = req.params;
    const verification = await verifySchoolByUdise(udiseCode);

    if (!verification.found) {
      return res.status(404).json({
        success: false,
        message: 'No school found for this UDISE code',
        data: {
          udiseCode,
          verified: false,
          source: verification.source
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        udiseCode,
        verified: true,
        source: verification.source,
        school: verification.school
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Link and verify a school with UDISE code
// @route   POST /api/v1/udise/link
// @access  Private (school_admin, district_admin, state_admin)
exports.linkUdiseToSchool = async (req, res, next) => {
  try {
    const { schoolId, udiseCode } = req.body;
    const school = await resolveSchoolForUser(req, schoolId);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Target school not found for UDISE linking'
      });
    }

    const verification = await verifySchoolByUdise(udiseCode);
    if (!verification.found) {
      return res.status(404).json({
        success: false,
        message: 'UDISE code could not be verified against registry'
      });
    }

    school.code = udiseCode;
    school.udiseCode = udiseCode;
    school.udiseVerified = true;
    school.udiseVerifiedAt = new Date();
    school.udiseVerificationSource = verification.source;

    if (verification.school.name) school.name = verification.school.name;
    if (verification.school.district) school.district = verification.school.district;
    if (verification.school.state) school.state = verification.school.state;
    if (verification.school.schoolCategory) school.schoolCategory = verification.school.schoolCategory;
    if (verification.school.managementType) school.managementType = verification.school.managementType;
    if (verification.school.addressLine) school.addressLine = verification.school.addressLine;

    await school.save();

    await logAuditEvent({
      actorId: req.user._id.toString(),
      actorRole: req.user.role,
      action: 'UDISE_LINKED_AND_VERIFIED',
      targetType: 'SCHOOL',
      targetId: school._id.toString(),
      metadata: {
        udiseCode,
        source: verification.source
      },
      req,
      status: 'success'
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'School successfully linked and verified with UDISE',
      data: {
        schoolId: school._id,
        schoolName: school.name,
        udiseCode: school.udiseCode,
        udiseVerified: school.udiseVerified,
        udiseVerifiedAt: school.udiseVerifiedAt,
        udiseVerificationSource: school.udiseVerificationSource
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get UDISE status for a school
// @route   GET /api/v1/udise/status/:schoolId?
// @access  Private (school_admin, district_admin, state_admin)
exports.getUdiseStatus = async (req, res, next) => {
  try {
    const schoolId = req.params.schoolId || null;
    const school = await resolveSchoolForUser(req, schoolId);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found for UDISE status check'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        schoolId: school._id,
        schoolName: school.name,
        udiseCode: school.udiseCode || school.code,
        udiseVerified: school.udiseVerified,
        udiseVerifiedAt: school.udiseVerifiedAt,
        udiseVerificationSource: school.udiseVerificationSource,
        district: school.district,
        state: school.state,
        schoolCategory: school.schoolCategory,
        managementType: school.managementType
      }
    });
  } catch (error) {
    return next(error);
  }
};
