const axios = require('axios');
const colors = require('colors');

const BASE_URL = process.env.API_URL || 'http://localhost:5001/api/v1';

const DEMO_ACCOUNTS = [
  { email: 'state.admin@ecokids.demo', password: 'Demo@123', role: 'State Admin' },
  { email: 'district.admin@ecokids.demo', password: 'Demo@123', role: 'District Admin' },
  { email: 'school.admin@dps-delhi.demo', password: 'Demo@123', role: 'School Admin' },
  { email: 'teacher1@dps-delhi.demo', password: 'Demo@123', role: 'Teacher' },
  { email: 'teacher2@kendriya.demo', password: 'Demo@123', role: 'Teacher' },
  { email: 'arjun.student@dps-delhi.demo', password: 'Demo@123', role: 'Student (Arjun - 4250pts)' },
  { email: 'priya.student@dps-delhi.demo', password: 'Demo@123', role: 'Student (Priya - 3890pts)' },
  { email: 'neha.student@kendriya.demo', password: 'Demo@123', role: 'Student (Neha - 3325pts)' },
  { email: 'kabir.student@kendriya.demo', password: 'Demo@123', role: 'Student (Kabir - 2980pts)' },
  { email: 'aisha.student@sarvodaya.demo', password: 'Demo@123', role: 'Student (Aisha - 2715pts)' }
];

const TEST_ENDPOINTS = [
  { method: 'GET', path: '/leaderboards', roleRequired: 'Student', description: 'Leaderboard Data' },
  { method: 'GET', path: '/school-admin/dashboard', roleRequired: 'School Admin', description: 'School Admin Dashboard' },
  { method: 'GET', path: '/activities/feed', roleRequired: 'Student', description: 'Activity Feed' },
  { method: 'GET', path: '/health', roleRequired: null, description: 'Health Check (Public)', baseUrl: BASE_URL.replace('/api/v1', '/api') }
];

let passCount = 0;
let failCount = 0;

const logPass = (message) => {
  console.log('✓'.green, message);
  passCount++;
};

const logFail = (message) => {
  console.log('✗'.red, message);
  failCount++;
};

const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    if (response.data.success && response.data.token) {
      return response.data.token;
    }
    throw new Error('Login failed: no token returned');
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

const testEndpoint = async (endpoint, token) => {
  try {
    const url = endpoint.baseUrl ? `${endpoint.baseUrl}${endpoint.path}` : `${BASE_URL}${endpoint.path}`;
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    
    const response = await axios({ method: endpoint.method, url, ...config });
    
    if (response.status === 200 && response.data) {
      return { success: true };
    }
    throw new Error(`Unexpected response: ${response.status}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

const runVerification = async () => {
  console.log('\n' + '='.repeat(60).cyan);
  console.log(' EcoKids Conference Demo Verification Script'.bold.cyan);
  console.log('='.repeat(60).cyan + '\n');

  console.log('Testing Login for All 10 Demo Accounts...\n'.bold.yellow);

  const tokens = {};

  for (const account of DEMO_ACCOUNTS) {
    try {
      const token = await loginUser(account.email, account.password);
      tokens[account.email] = token;
      logPass(`${account.role.padEnd(30)} - ${account.email}`);
    } catch (error) {
      logFail(`${account.role.padEnd(30)} - ${account.email} (${error.message})`);
    }
  }

  console.log('\n' + 'Testing Critical API Endpoints...\n'.bold.yellow);

  for (const endpoint of TEST_ENDPOINTS) {
    let token = null;
    
    if (endpoint.roleRequired) {
      const account = DEMO_ACCOUNTS.find(acc => acc.role.includes(endpoint.roleRequired));
      token = account ? tokens[account.email] : null;
    }

    try {
      await testEndpoint(endpoint, token);
      logPass(`${endpoint.method} ${endpoint.path.padEnd(35)} - ${endpoint.description}`);
    } catch (error) {
      logFail(`${endpoint.method} ${endpoint.path.padEnd(35)} - ${endpoint.description} (${error.message})`);
    }
  }

  console.log('\n' + '='.repeat(60).cyan);
  console.log(` RESULTS: ${passCount.toString().green} PASSED | ${failCount.toString().red} FAILED`);
  console.log('='.repeat(60).cyan + '\n');

  if (failCount === 0) {
    console.log('🎉 All checks passed! Demo is ready for conference presentation.\n'.bold.green);
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Please review errors above.\n'.bold.red);
    process.exit(1);
  }
};

// Run verification
runVerification().catch(err => {
  console.error('Fatal error during verification:'.red, err.message);
  process.exit(1);
});
