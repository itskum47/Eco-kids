import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 100 },  // Ramp up to 100 users
        { duration: '3m', target: 500 },   // Spike to 500 users
        { duration: '1m', target: 50 },    // Scale down
        { duration: '30s', target: 0 },    // Cool down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
        http_req_failed: ['rate<0.01'],   // Error rate must be < 1%
    },
};

export default function () {
    // Using localhost for local test, or point to production staging URL if available
    let res = http.get('http://localhost:5001/api/users/leaderboard');

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}
