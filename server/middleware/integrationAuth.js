const crypto = require('crypto');
const IntegrationKey = require('../models/IntegrationKey');

/**
 * Middleware to intercept API Key integrations instead of JWTs
 * Used exclusively for external machine-to-machine bounds
 */
const integrateAuth = async (req, res, next) => {
    try {
        const rawKey = req.header('x-api-key');

        if (!rawKey) {
            return res.status(401).json({
                success: false,
                message: 'Access Denied: Missing x-api-key header'
            });
        }

        // Hash the incoming key to compare safely
        const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

        // Retrieve active key mapping
        const integration = await IntegrationKey.findOne({
            apiKeyHash: hashedKey,
            isActive: true
        });

        if (!integration) {
            return res.status(401).json({
                success: false,
                message: 'Access Denied: Invalid or revoked integration key'
            });
        }

        // Attach bounded identity to resolving request
        req.integrationKey = {
            _id: integration._id,
            name: integration.name,
            organization: integration.organization,
            scope: integration.scope,
            state: integration.state,
            district: integration.district
        };

        // Update last usage timestamp blindly (does not need to block)
        IntegrationKey.updateOne(
            { _id: integration._id },
            { $set: { lastUsedAt: new Date() } }
        ).exec();

        next();
    } catch (error) {
        console.error('Integration Auth Error:', error);
        res.status(500).json({
            success: false,
            message: 'Integration boundary resolution failure'
        });
    }
};

module.exports = { integrateAuth };
