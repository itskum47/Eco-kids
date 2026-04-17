const express = require('express');
const request = require('supertest');

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'u1', role: 'student' };
    next();
  },
  authorize: () => (req, res, next) => next()
}));

jest.mock('../controllers/impactController', () => ({
  getMyImpact: (req, res) => res.status(200).json({ success: true, data: { environmentalImpact: {} } }),
  getGlobalImpact: (req, res) => res.status(200).json({ success: true }),
  getSchoolImpact: (req, res) => res.status(200).json({ success: true }),
  getImpactLeaderboard: (req, res) => res.status(200).json({ success: true }),
  getDistrictImpact: (req, res) => res.status(200).json({ success: true }),
  getUserImpactHistory: (req, res) => res.status(200).json({ success: true }),
  getImpactStats: (req, res) => res.status(200).json({ success: true }),
  logDailyImpactAction: (req, res) => res.status(201).json({ success: true }),
  getMyImpactMetrics: (req, res) => res.status(200).json({ success: true }),
  getImpactBaseline: (req, res) => res.status(200).json({ success: true, data: null }),
  setImpactBaseline: (req, res) => res.status(200).json({ success: true }),
  getImpactComparison: (req, res) => res.status(200).json({ success: true }),
  getImpactTrend: (req, res) => res.status(200).json({ success: true })
}));

jest.mock('../controllers/treeVerificationController', () => ({
  getTreeSpecies: (req, res) => res.status(200).json({ success: true, data: [] }),
  plantTree: (req, res) => res.status(201).json({ success: true, data: { plantedTreeId: 'pt1' } }),
  submitTreeFollowUp: (req, res) => res.status(200).json({ success: true }),
  reviewTreeFollowUp: (req, res) => res.status(200).json({ success: true }),
  getMyTrees: (req, res) => res.status(200).json({ success: true, data: [] })
}));

const impactRouter = require('../routes/impact');
const treeRouter = require('../routes/treeVerification');

describe('Smoke API checks', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/impact', impactRouter);
    app.use('/api/v1/trees', treeRouter);
  });

  test('tree species endpoint is accessible', async () => {
    const res = await request(app).get('/api/v1/trees/species?region=urban');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('impact metrics endpoint responds', async () => {
    const res = await request(app).get('/api/v1/impact/me/metrics?period=month');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('tree planting endpoint responds', async () => {
    const res = await request(app).post('/api/v1/trees/plant').send({ speciesId: 's1', photoUrl: 'http://img' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('user trees endpoint responds', async () => {
    const res = await request(app).get('/api/v1/trees/my-trees');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
