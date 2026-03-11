const { parse } = require('csv-parse/sync');
const User = require('../models/User');

const MAX_IMPORT_ROWS = 1000;

const requiredColumns = [
  'name',
  'email',
  'grade',
  'class',
  'rollNumber',
  'parentEmail',
  'parentPhone'
];

const normalizePhone = (value = '') => value.replace(/\s+/g, '').replace(/^\+91/, '');

exports.bulkImportStudents = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const csvData = req.file.buffer.toString('utf-8');

    let records;
    try {
      records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CSV format',
        details: error.message
      });
    }

    if (!records.length) {
      return res.status(400).json({
        success: false,
        message: 'CSV has no rows'
      });
    }

    if (records.length > MAX_IMPORT_ROWS) {
      return res.status(400).json({
        success: false,
        message: `CSV too large. Maximum ${MAX_IMPORT_ROWS} rows allowed`
      });
    }

    const csvColumns = Object.keys(records[0] || {});
    const missingColumns = requiredColumns.filter((c) => !csvColumns.includes(c));

    if (missingColumns.length) {
      return res.status(400).json({
        success: false,
        message: 'CSV missing required columns',
        missingColumns
      });
    }

    const created = [];
    const failed = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2;

      try {
        const name = String(row.name || '').trim();
        const email = String(row.email || '').trim().toLowerCase();
        const grade = String(row.grade || '').trim();
        const className = String(row.class || '').trim();
        const rollNumber = String(row.rollNumber || '').trim();
        const parentEmail = String(row.parentEmail || '').trim().toLowerCase();
        const parentPhone = normalizePhone(String(row.parentPhone || ''));

        if (!name || !email || !grade || !className || !rollNumber || !parentEmail || !parentPhone) {
          failed.push({
            row: rowNumber,
            email,
            error: 'Missing required field(s)'
          });
          continue;
        }

        const existing = await User.findOne({ email }).lean();
        if (existing) {
          failed.push({
            row: rowNumber,
            email,
            error: 'Email already exists'
          });
          continue;
        }

        const tempPassword = `EcoKids@${rollNumber}`;

        const user = await User.create({
          name,
          email,
          password: tempPassword,
          role: 'student',
          profile: {
            grade,
            school: req.user.profile?.school,
            schoolId: req.user.profile?.schoolId,
            district: req.user.profile?.district,
            state: req.user.profile?.state,
            city: req.user.profile?.city,
            bio: `Class ${className} | Roll ${rollNumber} | Parent ${parentPhone}`
          },
          isActive: true
        });

        created.push({
          id: user._id,
          row: rowNumber,
          name,
          email,
          tempPassword
        });
      } catch (error) {
        failed.push({
          row: rowNumber,
          email: row.email || '',
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Bulk import completed',
      createdCount: created.length,
      failedCount: failed.length,
      created,
      errorReport: failed
    });
  } catch (error) {
    next(error);
  }
};
