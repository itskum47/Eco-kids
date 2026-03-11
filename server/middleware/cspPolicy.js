const crypto = require('crypto');

function cspNonceMiddleware(req, res, next) {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
    next();
}

function getCSPConfig() {
    return {
        useDefaults: false,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                (req, res) => `'nonce-${res.locals.cspNonce}'`,
                'https://js.razorpay.com',
                'https://checkout.razorpay.com',
            ],
            styleSrc: [
                "'self'",
                (req, res) => `'nonce-${res.locals.cspNonce}'`,
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com',
            ],
            fontSrc: [
                "'self'",
                'https://fonts.gstatic.com',
            ],
            imgSrc: [
                "'self'",
                'https://res.cloudinary.com',
                'https://source.unsplash.com',
                'https://images.unsplash.com',
                'data:',
                'blob:',
            ],
            connectSrc: [
                "'self'",
                'https://res.cloudinary.com',
                'https://api.cloudinary.com',
                'https://checkout.razorpay.com',
                'wss:',
                'ws:',
            ],
            mediaSrc: [
                "'self'",
                'https://res.cloudinary.com',
                'blob:',
            ],
            frameSrc: ['https://checkout.razorpay.com'],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
            reportUri: '/api/csp-report',
        },
        reportOnly: false,
    };
}

module.exports = { cspNonceMiddleware, getCSPConfig };
