const crypto = require('crypto');
const SchoolRegistrationRequest = require('../models/SchoolRegistrationRequest');
const School = require('../models/School');
const User = require('../models/User');
const ClassSection = require('../models/ClassSection');
const { logAuditEvent } = require('../utils/auditLogger');
const { parse } = require('csv-parse/sync');

// ═══════════════════════════════════════════
// SCHOOL REGISTRATION
// ═══════════════════════════════════════════

// @desc    Submit school registration request
// @route   POST /api/schools/register
// @access  Public
exports.registerSchool = async (req, res, next) => {
    try {
        const { schoolName, udiseCode, adminName, adminEmail, adminPhone, state, district, city, schoolType, studentCount } = req.body;

        // Check if UDISE code already registered
        const existingSchool = await School.findOne({
            $or: [{ code: udiseCode }, { udiseCode }]
        });
        if (existingSchool) {
            return res.status(409).json({
                success: false,
                message: 'A school with this UDISE code is already registered'
            });
        }

        // Check for pending request
        const existingRequest = await SchoolRegistrationRequest.findOne({
            udiseCode,
            status: 'pending'
        });
        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: 'A registration request for this UDISE code is already pending'
            });
        }

        const request = await SchoolRegistrationRequest.create({
            schoolName, udiseCode, adminName, adminEmail, adminPhone,
            state, district, city, schoolType, studentCount
        });

        res.status(201).json({
            success: true,
            message: 'Registration request submitted. An admin will review it within 48 hours.',
            data: { requestId: request._id, status: request.status }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Lookup school by UDISE code
// @route   GET /api/schools/lookup
// @access  Public
exports.lookupSchool = async (req, res, next) => {
    try {
        const { udise } = req.query;
        if (!udise || !/^\d{11}$/.test(udise)) {
            return res.status(400).json({
                success: false,
                message: 'Valid 11-digit UDISE code required'
            });
        }

        const school = await School.findOne({
            $or: [{ code: udise }, { udiseCode: udise }]
        }).lean();
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'No school found with this UDISE code'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                name: school.name,
                district: school.district,
                state: school.state,
                isActive: school.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending school registration requests
// @route   GET /api/schools/requests
// @access  Private/Admin
exports.getRegistrationRequests = async (req, res, next) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status !== 'all') filter.status = status;

        const requests = await SchoolRegistrationRequest.find(filter)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('reviewedBy', 'name')
            .lean();

        const total = await SchoolRegistrationRequest.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: requests.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve school registration
// @route   PATCH /api/schools/requests/:id/approve
// @access  Private/Admin
exports.approveRegistration = async (req, res, next) => {
    try {
        const request = await SchoolRegistrationRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Request already ${request.status}` });
        }

        // Create the school
        const school = await School.create({
            name: request.schoolName,
            code: request.udiseCode,
            udiseCode: request.udiseCode,
            udiseVerified: true,
            udiseVerifiedAt: new Date(),
            udiseVerificationSource: 'manual_review',
            district: request.district,
            state: request.state,
            principalContact: {
                name: request.adminName,
                email: request.adminEmail,
                phone: request.adminPhone
            }
        });

        // Create school_admin user
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const adminUser = await User.create({
            name: request.adminName,
            email: request.adminEmail,
            password: tempPassword,
            role: 'school_admin',
            profile: {
                school: school.name,
                district: school.district,
                state: school.state
            },
            lastLogin: null,
            isActive: true
        });

        // Update request
        request.status = 'approved';
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        request.createdSchoolId = school._id;
        request.createdAdminUserId = adminUser._id;
        request.notes = req.body.notes || '';
        await request.save();

        await logAuditEvent({
            actorId: req.user._id.toString(),
            actorRole: req.user.role,
            action: 'SCHOOL_REGISTRATION_APPROVED',
            targetType: 'SCHOOL',
            targetId: school._id.toString(),
            metadata: { udiseCode: request.udiseCode, adminEmail: request.adminEmail },
            req,
            status: 'success'
        }).catch(() => { });

        res.status(200).json({
            success: true,
            message: 'School registered successfully',
            data: {
                school: { id: school._id, name: school.name, code: school.code },
                admin: { id: adminUser._id, email: adminUser.email, tempPassword }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject school registration
// @route   PATCH /api/schools/requests/:id/reject
// @access  Private/Admin
exports.rejectRegistration = async (req, res, next) => {
    try {
        const request = await SchoolRegistrationRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Request already ${request.status}` });
        }

        request.status = 'rejected';
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        request.notes = req.body.notes || 'Registration rejected';
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Registration rejected',
            data: request
        });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════════
// CLASS SECTION MANAGEMENT
// ═══════════════════════════════════════════

// @desc    Create a class section
// @route   POST /api/school-onboarding/sections
// @access  Private/Teacher,School_Admin
exports.createSection = async (req, res, next) => {
    try {
        const { name, grade, academicYear, schoolId } = req.body;

        // Determine school from context
        const resolvedSchoolId = schoolId || req.user.profile?.schoolId;
        if (!resolvedSchoolId) {
            // Try to find school by name
            const school = await School.findOne({ name: req.user.profile?.school });
            if (!school) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not determine school. Please provide schoolId.'
                });
            }
            req.body.schoolId = school._id;
        }

        const section = await ClassSection.create({
            schoolId: req.body.schoolId || resolvedSchoolId,
            name,
            grade,
            teacherId: req.user.role === 'teacher' ? req.user._id : null,
            academicYear: academicYear || `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
            students: []
        });

        res.status(201).json({
            success: true,
            data: section
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'A section with this name already exists for this school and academic year'
            });
        }
        next(error);
    }
};

// @desc    Get sections for a school
// @route   GET /api/school-onboarding/sections
// @access  Private/Teacher,School_Admin
exports.getSections = async (req, res, next) => {
    try {
        const { schoolId, grade, academicYear } = req.query;

        const filter = { isActive: true };
        if (schoolId) filter.schoolId = schoolId;
        if (grade) filter.grade = parseInt(grade);
        if (academicYear) filter.academicYear = academicYear;

        // If teacher, only show their sections
        if (req.user.role === 'teacher') {
            filter.teacherId = req.user._id;
        }

        const sections = await ClassSection.find(filter)
            .populate('teacherId', 'name email')
            .populate('students', 'name email profile.grade gamification.ecoPointsTotal')
            .sort({ grade: 1, name: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: sections.length,
            data: sections
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add/remove students from a section
// @route   PATCH /api/school-onboarding/sections/:id/students
// @access  Private/Teacher,School_Admin
exports.updateSectionStudents = async (req, res, next) => {
    try {
        const { addStudents = [], removeStudents = [] } = req.body;

        const section = await ClassSection.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        // Add students
        if (addStudents.length > 0) {
            const newStudentIds = addStudents.filter(id =>
                !section.students.some(s => s.toString() === id)
            );
            section.students.push(...newStudentIds);
        }

        // Remove students
        if (removeStudents.length > 0) {
            section.students = section.students.filter(
                id => !removeStudents.includes(id.toString())
            );
        }

        await section.save();

        res.status(200).json({
            success: true,
            message: 'Section students updated',
            data: section
        });
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════════
// BULK STUDENT CSV IMPORT
// ═══════════════════════════════════════════

// @desc    Import students from CSV
// @route   POST /api/school-onboarding/students/import
// @access  Private/School_Admin
exports.importStudentsCSV = async (req, res, next) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: 'CSV file is required'
            });
        }

        const csvString = req.file.buffer.toString('utf-8');
        let records;

        try {
            records = parse(csvString, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid CSV format. Expected columns: name, email, class, section, dateOfBirth'
            });
        }

        if (records.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'CSV file is empty'
            });
        }

        if (records.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 500 students per import. Please split into multiple files.'
            });
        }

        const results = { created: [], errors: [], skipped: [] };
        const defaultPassword = 'EcoKids@2026';

        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            const rowNum = i + 2; // +2 for header row + 0-index

            try {
                // Validate required fields
                if (!row.name || !row.email) {
                    results.errors.push({ row: rowNum, error: 'Name and email are required', data: row });
                    continue;
                }

                // Check for existing user
                const existing = await User.findOne({ email: row.email.toLowerCase() });
                if (existing) {
                    results.skipped.push({ row: rowNum, email: row.email, reason: 'Email already registered' });
                    continue;
                }

                // Create student
                const student = await User.create({
                    name: row.name.trim(),
                    email: row.email.trim().toLowerCase(),
                    password: defaultPassword,
                    role: 'student',
                    profile: {
                        grade: row.class ? parseInt(row.class) : undefined,
                        school: req.user.profile?.school,
                        district: req.user.profile?.district,
                        state: req.user.profile?.state,
                        dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined
                    },
                    isActive: true
                });

                results.created.push({ row: rowNum, id: student._id, name: student.name, email: student.email });
            } catch (rowError) {
                results.errors.push({ row: rowNum, error: rowError.message, data: row });
            }
        }

        await logAuditEvent({
            actorId: req.user._id.toString(),
            actorRole: req.user.role,
            action: 'BULK_STUDENT_IMPORT',
            targetType: 'USER',
            targetId: req.user._id.toString(),
            metadata: {
                totalRows: records.length,
                created: results.created.length,
                errors: results.errors.length,
                skipped: results.skipped.length
            },
            req,
            status: 'success'
        }).catch(() => { });

        res.status(200).json({
            success: true,
            message: `Import complete: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`,
            data: results
        });
    } catch (error) {
        next(error);
    }
};
