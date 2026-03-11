const SchoolSubscription = require('../models/SchoolSubscription');

/**
 * Subscription enforcement middleware.
 * Checks if the school's plan allows the requested feature.
 * Usage: app.use('/api/competitions', requireFeature('competitions'));
 */
function requireFeature(featureName) {
    return async (req, res, next) => {
        try {
            if (!req.user?.profile?.school) return next(); // No school = skip (admin, etc.)

            const sub = await SchoolSubscription.findOne({ school: req.user.profile.school }).lean();
            if (!sub) return next(); // No subscription = free tier, let it pass or block

            if (sub.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'School subscription is not active. Please contact your school admin.',
                    subscriptionStatus: sub.status,
                });
            }

            if (sub.limits.features.includes('all') || sub.limits.features.includes(featureName)) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: `The "${featureName}" feature requires a higher subscription plan.`,
                currentPlan: sub.plan,
                requiredFeature: featureName,
            });
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Check student/teacher capacity before registration.
 */
function requireCapacity(role) {
    return async (req, res, next) => {
        try {
            const schoolId = req.body?.school || req.user?.profile?.school;
            if (!schoolId) return next();

            const sub = await SchoolSubscription.findOne({ school: schoolId }).lean();
            if (!sub) return next();

            if (role === 'student' && sub.usage.currentStudents >= sub.limits.students) {
                return res.status(403).json({
                    success: false,
                    message: `Student limit reached (${sub.limits.students}). Upgrade your plan.`,
                    currentPlan: sub.plan,
                    limit: sub.limits.students,
                    current: sub.usage.currentStudents,
                });
            }

            if (role === 'teacher' && sub.usage.currentTeachers >= sub.limits.teachers) {
                return res.status(403).json({
                    success: false,
                    message: `Teacher limit reached (${sub.limits.teachers}). Upgrade your plan.`,
                    currentPlan: sub.plan,
                    limit: sub.limits.teachers,
                    current: sub.usage.currentTeachers,
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = { requireFeature, requireCapacity };
