import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';

export const options = {
    stages: [
        { duration: '10s', target: 50 },
        { duration: '30s', target: 500 },
        { duration: '1m', target: 500 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000', 'p(99)<5000'],
        http_req_failed: ['rate<0.05'],
        checks: ['rate>0.95'],
    },
};

export default function () {
    const health = http.get(`${BASE_URL}/health`);
    check(health, { 'health ok': (r) => r.status === 200 });

    const endpoints = [
        '/api/leaderboard?scope=global&limit=10',
        '/api/environmental-lessons?page=1&limit=10',
        '/api/quizzes?page=1&limit=5',
        '/api/content?status=published&page=1&limit=10',
    ];

    const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
    const res = http.get(`${BASE_URL}${ep}`);
    check(res, { 'endpoint responds': (r) => r.status < 500 });

    sleep(0.5);
}
