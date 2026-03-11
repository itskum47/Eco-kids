const CircuitBreaker = require('opossum');
const logger = require('./logger');

const breakerOptions = {
    timeout: 5000, // Timeout after 5 seconds
    errorThresholdPercentage: 50, // Open circuit when 50% of requests fail
    resetTimeout: 30000 // Test recovery after 30 seconds
};

// Generic Circuit Breaker Factory
const createBreaker = (asyncFunction, name = 'Service') => {
    const breaker = new CircuitBreaker(asyncFunction, { ...breakerOptions, name });

    breaker.fallback(() => {
        logger.warn(`[CircuitBreaker] ⚠️ ${name} is currently UNAVAILABLE. Returning fallback.`);
        throw new Error(`${name} Circuit Open: High Error Rate or External Outage`);
    });

    breaker.on('open', () => logger.error(`[CircuitBreaker] 🚨 ${name} CIRCUIT OPEN.`));
    breaker.on('halfOpen', () => logger.warn(`[CircuitBreaker] ⏳ ${name} CIRCUIT HALF-OPEN.`));
    breaker.on('close', () => logger.info(`[CircuitBreaker] ✅ ${name} CIRCUIT CLOSED.`));

    return breaker;
};

// MongoDB Global Breaker
const mongoBreaker = new CircuitBreaker(async (op) => await op(), { ...breakerOptions, timeout: 10000, name: 'mongodb' });
mongoBreaker.on('open', () => logger.error(`[CircuitBreaker] 🚨 MongoDB CIRCUIT OPEN.`));
mongoBreaker.on('close', () => logger.info(`[CircuitBreaker] ✅ MongoDB CIRCUIT CLOSED.`));

const executeMongoSafe = async (op) => {
    return await mongoBreaker.fire(op);
};

module.exports = {
    createBreaker,
    executeMongoSafe
};
