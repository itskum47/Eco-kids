const client = require('prom-client');

const register = new client.Registry();

register.setDefaultLabels({ app: 'ecokids-api' });

client.collectDefaultMetrics({ register, prefix: 'ecokids_' });

// ── HTTP Request Metrics ──
const httpRequestDuration = new client.Histogram({
    name: 'ecokids_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 3, 5],
    registers: [register]
});

const httpRequestsTotal = new client.Counter({
    name: 'ecokids_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

// ── Business Metrics ──
const ecoPointsAwarded = new client.Counter({
    name: 'ecokids_eco_points_awarded_total',
    help: 'Total eco-points awarded',
    registers: [register]
});

const activitySubmissions = new client.Counter({
    name: 'ecokids_activity_submissions_total',
    help: 'Total activity submissions',
    labelNames: ['status'],
    registers: [register]
});

const fraudFlags = new client.Counter({
    name: 'ecokids_fraud_flags_total',
    help: 'Total fraud flags raised',
    labelNames: ['type'],
    registers: [register]
});

const activeUsers = new client.Gauge({
    name: 'ecokids_active_users',
    help: 'Number of currently active users',
    registers: [register]
});

// ── Cache Metrics ──
const cacheHits = new client.Counter({
    name: 'ecokids_cache_hits_total',
    help: 'Total cache hits',
    labelNames: ['key_prefix'],
    registers: [register]
});

const cacheMisses = new client.Counter({
    name: 'ecokids_cache_misses_total',
    help: 'Total cache misses',
    labelNames: ['key_prefix'],
    registers: [register]
});

// ── Queue Metrics ──
const queueDepth = new client.Gauge({
    name: 'ecokids_queue_depth',
    help: 'Number of jobs waiting in queue',
    labelNames: ['queue_name'],
    registers: [register]
});

// ── Database Metrics ──
const mongoConnections = new client.Gauge({
    name: 'ecokids_mongo_active_connections',
    help: 'Number of active MongoDB connections',
    registers: [register]
});

// ── Express Middleware ──
function metricsMiddleware(req, res, next) {
    if (req.path === '/metrics' || req.path === '/health') {
        return next();
    }

    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
        const route = req.route ? req.route.path : req.path;
        const labels = {
            method: req.method,
            route: route,
            status_code: res.statusCode
        };
        end(labels);
        httpRequestsTotal.inc(labels);
    });

    next();
}

// ── Metrics Endpoint Handler ──
async function metricsHandler(req, res) {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err.message);
    }
}

module.exports = {
    register,
    metricsMiddleware,
    metricsHandler,
    ecoPointsAwarded,
    activitySubmissions,
    fraudFlags,
    activeUsers,
    cacheHits,
    cacheMisses,
    queueDepth,
    mongoConnections,
    httpRequestDuration,
    httpRequestsTotal
};
