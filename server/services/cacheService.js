const Redis = require('ioredis');

// Production configurations with failover limits
const redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
    retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff maxing at 2s
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
});

redis.on('error', (err) => {
    console.error('[Redis Core] Connection Error:', err);
});

redis.on('connect', () => {
    console.log('[Redis Core] Connected successfully');
});

// Isolated Redis connection strictly for BullMQ (P5 Blocker)
const queueRedis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

// Alias for backwards compatibility but structurally isolated
const bullmqRedis = queueRedis;

/**
 * Advanced Redis Caching Engine
 */
class CacheService {
    /**
     * Generates a fully qualified versioned key.
     * Format: `namespace:key:v{CACHE_VERSION}`
     */
    async getVersionedKey(namespace, keyName) {
        let version = await redis.get(`CACHE_VERSION:${namespace}`);
        if (!version) {
            version = '1';
            await redis.set(`CACHE_VERSION:${namespace}`, version);
        }
        return `${namespace}:${keyName}:v${version}`;
    }

    /**
     * Instantly invalidates all caches under a namespace
     * by simply rolling the master version forward.
     */
    async invalidateNamespace(namespace) {
        const newVersion = await redis.incr(`CACHE_VERSION:${namespace}`);
        return newVersion;
    }

    /**
     * Set a cache entry with Time-to-Live (TTL in seconds).
     * Optional namespace parameter versions the key.
     */
    async set(key, data, ttlSeconds = 300, namespace = null) {
        try {
            let finalKey = key;
            if (namespace) {
                finalKey = await this.getVersionedKey(namespace, key);
            }

            const payload = JSON.stringify(data);
            await redis.setex(finalKey, ttlSeconds, payload);
            return true;
        } catch (error) {
            console.error('[Redis Set] Error:', error);
            return false;
        }
    }

    /**
     * Retrieve a parsed JSON payload from Cache.
     * Optional namespace evaluates against the live version.
     */
    async get(key, namespace = null) {
        try {
            let finalKey = key;
            if (namespace) {
                finalKey = await this.getVersionedKey(namespace, key);
            }

            const payload = await redis.get(finalKey);
            if (!payload) return null;
            return JSON.parse(payload);
        } catch (error) {
            console.error('[Redis Get] Error:', error);
            return null;
        }
    }

    /**
     * Directly delete a key (Not commonly used with versioning active)
     */
    async del(key) {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            console.error('[Redis Del] Error:', error);
            return false;
        }
    }

    /**
     * Add or update a member's score in a Sorted Set (ZSET)
     */
    async zadd(key, score, member) {
        try {
            await redis.zadd(key, score, member);
            return true;
        } catch (error) {
            console.error('[Redis ZADD] Error:', error);
            return false;
        }
    }

    /**
     * Get top members from a ZSET by descending score
     */
    async zrevrange(key, start, stop, withScores = false) {
        try {
            if (withScores) {
                return await redis.zrevrange(key, start, stop, 'WITHSCORES');
            }
            return await redis.zrevrange(key, start, stop);
        } catch (error) {
            console.error('[Redis ZREVRANGE] Error:', error);
            return [];
        }
    }

    /**
     * Get the rank of a member in a ZSET (0-based, descending)
     */
    async zrevrank(key, member) {
        try {
            return await redis.zrevrank(key, member);
        } catch (error) {
            console.error('[Redis ZREVRANK] Error:', error);
            return null;
        }
    }

    /**
     * Close connection gracefully
     */
    async quit() {
        await redis.quit();
    }
}

// ── TTL Presets ──
const TTL = {
    LEADERBOARD: 300,       // 5 min
    DASHBOARD: 120,         // 2 min
    SCHOOL_ANALYTICS: 1800, // 30 min
    CONTENT: 3600,          // 1 hour
    USER_PROFILE: 600,      // 10 min
    SHORT: 60,              // 1 min
};

// ── Domain-specific Invalidation Hooks ──
async function invalidateLeaderboard(scope, id) {
    const cacheInst = new CacheService();
    await cacheInst.invalidateNamespace(`leaderboard_${scope}_${id || 'global'}`);
}

async function invalidateDashboard(userId) {
    await redis.del(`dashboard:${userId}`);
}

async function invalidateSchoolAnalytics(schoolId) {
    await redis.del(`school_analytics:${schoolId}`);
}

async function invalidateContent(contentId) {
    const cacheInst = new CacheService();
    await cacheInst.invalidateNamespace('content');
}

// ── Cache Warming ──
async function warmCaches() {
    console.log('[Cache] Warming started...');
    try {
        const User = require('../models/User');
        const top10 = await User.find({ role: 'student', isActive: true })
            .sort({ 'gamification.ecoPoints': -1 })
            .limit(10)
            .select('name gamification.ecoPoints gamification.level profile.school')
            .lean();
        const cacheInst = new CacheService();
        await cacheInst.set('global_top10', top10, TTL.LEADERBOARD, 'leaderboard');

        const ContentItem = require('../models/ContentItem');
        const count = await ContentItem.countDocuments({ status: 'published' });
        await cacheInst.set('published_count', count, TTL.CONTENT, 'content');

        console.log('[Cache] Warming complete');
    } catch (err) {
        console.error('[Cache] Warming failed (non-fatal):', err.message);
    }
}

// ── Hit Rate Monitor ──
async function getHitRate() {
    try {
        const info = await redis.info('stats');
        const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
        const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
        const total = hits + misses;
        return total > 0 ? ((hits / total) * 100).toFixed(1) : 'N/A';
    } catch { return 'N/A'; }
}

module.exports = {
    redisClient: redis,
    bullmqRedisClient: bullmqRedis,
    queueRedis: queueRedis,
    cacheService: new CacheService(),
    TTL,
    invalidateLeaderboard,
    invalidateDashboard,
    invalidateSchoolAnalytics,
    invalidateContent,
    warmCaches,
    getHitRate,
};
