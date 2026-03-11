import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 5 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

export default function () {
    const health = http.get(`${BASE_URL}/health`);
    check(health, {
        'health 200': (r) => r.status === 200,
        'health <200ms': (r) => r.timings.duration < 200,
    });

    const leaderboard = http.get(`${BASE_URL}/api/leaderboard?scope=global&limit=10`);
    check(leaderboard, {
        'leaderboard 200': (r) => r.status === 200 || r.status === 401,
    });

    const lessons = http.get(`${BASE_URL}/api/environmental-lessons?page=1&limit=10`);
    check(lessons, {
        'lessons responds': (r) => r.status === 200 || r.status === 401,
    });

    sleep(1);
}
