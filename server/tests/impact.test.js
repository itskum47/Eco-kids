const impactController = require('../controllers/impactController');
const User = require('../models/User');
const ImpactDailyAction = require('../models/ImpactDailyAction');
const Notification = require('../models/Notification');

jest.mock('../models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../models/ImpactDailyAction', () => ({
  create: jest.fn(),
  aggregate: jest.fn()
}));

jest.mock('../models/Notification', () => ({
  create: jest.fn()
}));

const createRes = () => {
  let resolveDone;
  const done = new Promise((resolve) => {
    resolveDone = resolve;
  });

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation(function jsonImpl() {
      resolveDone();
      return this;
    }),
    _done: done
  };

  return res;
};

const run = async (handler, req, res) => {
  let nextError = null;
  handler(req, res, (err) => {
    nextError = err;
  });
  await Promise.race([res._done, new Promise((resolve) => setTimeout(resolve, 25))]);
  if (nextError) throw nextError;
};

describe('Impact Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Notification.create.mockResolvedValue({});
  });

  test('GET metrics returns month period by default', async () => {
    ImpactDailyAction.aggregate.mockResolvedValue([
      { co2Prevented: 8, waterSaved: 12, plasticReduced: 2, energySaved: 1, treesPlanted: 1, actionsCount: 3 }
    ]);

    const req = { user: { id: 'u1' }, query: {} };
    const res = createRes();

    await run(impactController.getMyImpactMetrics, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ period: 'month', co2: 8, actionsCount: 3 })
      })
    );
  });

  test('GET metrics respects requested period', async () => {
    ImpactDailyAction.aggregate.mockResolvedValue([
      { co2Prevented: 21, waterSaved: 50, plasticReduced: 4, energySaved: 6, treesPlanted: 0, actionsCount: 9 }
    ]);

    const req = { user: { id: 'u1' }, query: { period: 'quarter' } };
    const res = createRes();

    await run(impactController.getMyImpactMetrics, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ period: 'quarter', water: 50 })
      })
    );
  });

  test('POST daily-action validates actionType', async () => {
    const req = { user: { id: 'u1' }, body: {} };
    const res = createRes();

    await run(impactController.logDailyImpactAction, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('POST daily-action stores action and returns message', async () => {
    ImpactDailyAction.create.mockResolvedValue({ _id: 'a1', actionType: 'shower-5min' });
    User.findByIdAndUpdate.mockResolvedValue({});
    ImpactDailyAction.aggregate.mockResolvedValue([
      { co2Prevented: 5, waterSaved: 10, plasticReduced: 0, energySaved: 0, treesPlanted: 0, actionsCount: 1 }
    ]);

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ impactBaseline: { co2: 20, water: 100, plastic: 5, energy: 5 } })
    });

    const req = { user: { id: 'u1' }, body: { actionType: 'shower-5min', value: 1 } };
    const res = createRes();

    await run(impactController.logDailyImpactAction, req, res);

    expect(ImpactDailyAction.create).toHaveBeenCalled();
    expect(User.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ message: expect.stringContaining('saved') })
      })
    );
  });

  test('GET baseline returns null when baseline missing', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ impactBaseline: {} })
    });

    const req = { user: { id: 'u1' } };
    const res = createRes();

    await run(impactController.getImpactBaseline, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: null }));
  });

  test('POST baseline computes CO2 when omitted', async () => {
    User.findByIdAndUpdate.mockResolvedValue({
      impactBaseline: { co2: 10.5, water: 120, plastic: 2, energy: 3 }
    });

    const req = {
      user: { id: 'u1' },
      body: {
        showerDuration: 8,
        transportMode: 'car',
        meatDaysPerWeek: 2,
        waterUsagePerDay: 120,
        plastic: 2,
        energy: 3
      }
    };
    const res = createRes();

    await run(impactController.setImpactBaseline, req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('GET comparison returns baseline/current/delta', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ impactBaseline: { co2: 25, water: 150, plastic: 8, energy: 12 } })
    });
    ImpactDailyAction.aggregate.mockResolvedValue([
      { co2Prevented: 12, waterSaved: 40, plasticReduced: 3, energySaved: 2, treesPlanted: 1, actionsCount: 4 }
    ]);

    const req = { user: { id: 'u1' }, query: { period: 'month' } };
    const res = createRes();

    await run(impactController.getImpactComparison, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          baseline: expect.objectContaining({ co2: 25 }),
          current: expect.objectContaining({ co2: 12 }),
          delta: expect.any(Object)
        })
      })
    );
  });

  test('GET trend returns labeled monthly points', async () => {
    ImpactDailyAction.aggregate.mockResolvedValue([
      { year: 2026, month: 1, co2: 2, water: 3, plastic: 0, energy: 1, trees: 1 },
      { year: 2026, month: 2, co2: 4, water: 5, plastic: 1, energy: 1, trees: 0 }
    ]);

    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ impactBaseline: { co2: 30 } })
      })
    });

    const req = { user: { id: 'u1' }, query: { months: '6' } };
    const res = createRes();

    await run(impactController.getImpactTrend, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ label: '01/2026', baselineCo2: 30 }),
          expect.objectContaining({ label: '02/2026', baselineCo2: 30 })
        ])
      })
    );
  });
});
