#!/usr/bin/env node
const axios = require('axios');

const baseUrl = process.env.DEMO_BASE_URL || 'http://localhost:5001';
const token = process.env.DEMO_STUDENT_TOKEN;
const iterations = Number(process.env.LATENCY_ITERATIONS || 40);
const targetMs = Number(process.env.LATENCY_TARGET_MS || 500);

if (!token) {
  console.error('Missing DEMO_STUDENT_TOKEN');
  process.exit(1);
}

const endpoints = [
  '/api/v1/leaderboards/global',
  '/api/v1/leaderboards/my-rank',
  '/api/v1/impact/me',
];

const percentile = (values, p) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
};

(async () => {
  try {
    const results = {};

    for (const endpoint of endpoints) {
      const samples = [];
      for (let i = 0; i < iterations; i += 1) {
        const start = Date.now();
        await axios.get(`${baseUrl}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        samples.push(Date.now() - start);
      }
      results[endpoint] = {
        p50: percentile(samples, 50),
        p95: percentile(samples, 95),
        p99: percentile(samples, 99),
      };
    }

    let failed = false;
    Object.entries(results).forEach(([endpoint, stats]) => {
      console.log(`${endpoint} -> p50=${stats.p50}ms p95=${stats.p95}ms p99=${stats.p99}ms`);
      if (stats.p95 > targetMs) failed = true;
    });

    if (failed) {
      console.error(`Latency check failed: p95 exceeded ${targetMs}ms target`);
      process.exit(1);
    }

    console.log('Latency check passed');
  } catch (error) {
    console.error('Latency check failed:', error.message);
    process.exit(1);
  }
})();
