import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
const errorRate = new Rate('errors');
const latency = new Trend('custom_latency');

export const options = {
    stages: [
        { duration: '2m', target: 500 },
        { duration: '3m', target: 1000 },
        { duration: '5m', target: 2000 },
        { duration: '3m', target: 2000 },
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'],
        http_req_failed: ['rate<0.10'],
        errors: ['rate<0.10'],
    },
};

export default function () {
    const actions = [
        () => http.get(`${BASE_URL}/health`),
        () => http.get(`${BASE_URL}/api/leaderboard?scope=global&limit=10`),
        () => http.get(`${BASE_URL}/api/environmental-lessons?page=1&limit=10`),
        () => http.get(`${BASE_URL}/api/quizzes?page=1&limit=5`),
        () => http.get(`${BASE_URL}/api/content?status=published&page=1&limit=10`),
        () => http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
            email: `stress${__VU}@test.com`,
            password: 'test123'
        }), { headers: { 'Content-Type': 'application/json' } }),
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    const res = action();

    const ok = res.status < 500;
    errorRate.add(!ok);
    latency.add(res.timings.duration);

    check(res, { 'no 5xx': (r) => r.status < 500 });
    sleep(0.3);
}
