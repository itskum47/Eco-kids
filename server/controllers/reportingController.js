const EngagementEvent = require('../models/EngagementEvent');
const AuditLog = require('../models/AuditLog');
const { Parser } = require('json2csv');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responseEnvelope');
const {
    getEngagementFunnel,
    getEnvironmentalImpactReport,
    getUserEngagementReport,
    getSchoolReportRows,
    getNGOImpactSummary,
} = require('../services/reportingMetricsService');
const { getMetricsSummary } = require('../services/metricsEngineService');

// @desc    Get engagement funnel metrics
// @route   GET /api/reporting/funnel
// @access  Private/Admin
exports.getEngagementFunnel = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const funnel = await getEngagementFunnel(from, to);

        sendSuccess(res, { data: funnel });
    } catch (error) {
        next(error);
    }
};

// @desc    Export environmental impact report as CSV
// @route   GET /api/reporting/export
// @access  Private/Admin,District_Admin,State_Admin
exports.exportReport = async (req, res, next) => {
    try {
        const { format = 'csv', type = 'environmental_impact', from, to } = req.query;

        let data;

        if (type === 'environmental_impact') {
            data = await getEnvironmentalImpactReport({ from, to });
        } else if (type === 'user_engagement') {
            data = await getUserEngagementReport();
        } else {
            return sendError(res, {
                statusCode: 400,
                message: 'Invalid report type. Use: environmental_impact or user_engagement'
            });
        }

        if (format === 'csv') {
            if (data.length === 0) {
                return res.status(200).send('No data found for the specified criteria');
            }

            // Simple CSV generation
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row =>
                Object.values(row).map(val =>
                    typeof val === 'string' ? `"${val}"` : val
                ).join(',')
            );

            const csv = [headers, ...rows].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=ecokids-${type}-report.csv`);
            return res.status(200).send(csv);
        }

        // Default JSON
        sendSuccess(res, {
            data: {
                reportType: type,
                period: { from, to },
                count: data.length,
                rows: data
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Track engagement event
// @route   POST /api/reporting/track
// @access  Private
exports.trackEvent = async (req, res, next) => {
    try {
        const { event, metadata } = req.body;

        if (!event) {
            return res.status(400).json({
                success: false,
                message: 'Event name is required'
            });
        }

        await EngagementEvent.create({
            userId: req.user._id,
            event,
            metadata: metadata || {},
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        });

        sendSuccess(res, { statusCode: 201 });
    } catch (error) {
        next(error);
    }
};

// @desc    Get metrics engine summary
// @route   GET /api/reporting/metrics-summary
// @access  Private/Admin
exports.getMetricsSummary = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const summary = await getMetricsSummary({ from, to });

        sendSuccess(res, { data: summary });
    } catch (error) {
        next(error);
    }
};

exports.exportSchoolReportCsv = async (req, res, next) => {
    try {
        const { schoolId } = req.params;
        const { format = 'csv' } = req.query;

        if (format !== 'csv') {
            return sendError(res, {
                statusCode: 400,
                message: 'Only csv format is supported'
            });
        }

        const rows = await getSchoolReportRows({ schoolId });

        const parser = new Parser({
            fields: ['studentName', 'totalPoints', 'activitiesCompleted', 'badgesEarned', 'lastActive']
        });
        const csv = parser.parse(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="school-report.csv"');
        return res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

exports.getNGOImpactSummary = async (req, res, next) => {
    try {
        const { from, to, schoolId } = req.query;
        const summary = await getNGOImpactSummary({ from, to, schoolId });

        // Log this NGO report access
        await AuditLog.create({
            action: 'NGO_REPORT_GENERATED',
            actor: req.user._id,
            target: req.user._id,
            metadata: {
                reportType: 'ngo_impact_summary',
                period: { from, to },
                schoolId: schoolId || 'all'
            }
        });

        sendSuccess(res, {
            data: {
                totalStudents: summary.totalStudents,
                totalActivities: summary.totalActivities,
                activitiesByType: summary.activityStats,
                topSchools: summary.topSchools,
                sdgImpact: summary.sdgImpact,
                period: summary.period,
                generatedAt: new Date(),
                generatedBy: req.user._id
            }
        });
    } catch (error) {
        logger.error(`[NGO Report] Error generating NGO impact summary:`, error);
        next(error);
    }
};
