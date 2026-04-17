const treeController = require('../controllers/treeVerificationController');
const TreeSpecies = require('../models/TreeSpecies');
const PlantedTree = require('../models/PlantedTree');
const FollowUpTask = require('../models/FollowUpTask');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { awardEcoPoints } = require('../utils/ecoPointsManager');

jest.mock('../models/TreeSpecies', () => ({
  find: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../models/PlantedTree', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  aggregate: jest.fn()
}));

jest.mock('../models/FollowUpTask', () => ({
  insertMany: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../models/User', () => ({
  findById: jest.fn()
}));

jest.mock('../models/Notification', () => ({
  create: jest.fn()
}));

jest.mock('../utils/ecoPointsManager', () => ({
  awardEcoPoints: jest.fn()
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

describe('Tree Verification Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    awardEcoPoints.mockResolvedValue({});
    Notification.create.mockResolvedValue({});
  });

  test('GET species returns active species list', async () => {
    TreeSpecies.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ _id: 's1', commonNameEn: 'Neem' }])
        })
      })
    });

    const req = { query: { region: 'urban' } };
    const res = createRes();

    await run(treeController.getTreeSpecies, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 1 }));
  });

  test('POST plant validates required fields', async () => {
    const req = { user: { id: 'u1' }, body: { speciesId: '', photoUrl: '' } };
    const res = createRes();

    await run(treeController.plantTree, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('POST plant returns 404 when species not found', async () => {
    TreeSpecies.findById.mockResolvedValue(null);

    const req = { user: { id: 'u1' }, body: { speciesId: 'sp1', photoUrl: 'http://img' } };
    const res = createRes();

    await run(treeController.plantTree, req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('POST plant rejects non-region-aligned species', async () => {
    TreeSpecies.findById.mockResolvedValue({ _id: 'sp1', region: 'himalayan' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ profile: { state: 'Goa' } })
    });

    const req = { user: { id: 'u1' }, body: { speciesId: 'sp1', photoUrl: 'http://img' } };
    const res = createRes();

    await run(treeController.plantTree, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('POST plant creates tree and follow-up tasks', async () => {
    TreeSpecies.findById.mockResolvedValue({ _id: 'sp1', region: 'urban' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ profile: { state: 'Delhi' } })
    });
    PlantedTree.create.mockResolvedValue({ _id: 'pt1' });
    FollowUpTask.insertMany.mockResolvedValue([]);

    const req = {
      user: { id: 'u1' },
      body: { speciesId: 'sp1', photoUrl: 'http://img', notes: 'Planted in school garden' }
    };
    const res = createRes();

    await run(treeController.plantTree, req, res);

    expect(PlantedTree.create).toHaveBeenCalled();
    expect(FollowUpTask.insertMany).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
    expect(awardEcoPoints).toHaveBeenCalledWith('u1', 50, 'tree-planting-with-species', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('POST verify follow-up blocks unauthorized users', async () => {
    PlantedTree.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: 'pt1', userId: 'someone-else' })
    });

    const req = {
      params: { plantedTreeId: 'pt1' },
      user: { id: 'u1' },
      body: { followUpNumber: 1, photoUrl: 'http://img', health: 'healthy' }
    };
    const res = createRes();

    await run(treeController.submitTreeFollowUp, req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('POST verify follow-up submits when due date passed', async () => {
    const saveFollowUp = jest.fn().mockResolvedValue({});
    const saveTree = jest.fn().mockResolvedValue({});
    PlantedTree.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: 'pt1', userId: 'u1', save: saveTree })
    });
    FollowUpTask.findOne.mockResolvedValue({
      _id: 'fu1',
      status: 'pending',
      dueDate: new Date(Date.now() - 86400000),
      pointsAwarded: 25,
      save: saveFollowUp
    });

    const req = {
      params: { plantedTreeId: 'pt1' },
      user: { id: 'u1' },
      body: { followUpNumber: 1, photoUrl: 'http://img', health: 'healthy' }
    };
    const res = createRes();

    await run(treeController.submitTreeFollowUp, req, res);

    expect(saveFollowUp).toHaveBeenCalled();
    expect(saveTree).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('PUT review approves follow-up and awards points', async () => {
    const saveTask = jest.fn().mockResolvedValue({});
    FollowUpTask.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'fu1',
        status: 'submitted',
        pointsAwarded: 35,
        followUpNumber: 2,
        plantedTreeId: { userId: 'u1' },
        save: saveTask
      })
    });

    const req = {
      params: { followUpTaskId: 'fu1' },
      user: { id: 'teacher1' },
      body: { decision: 'approve', teacherNotes: 'Good survival rate' }
    };
    const res = createRes();

    await run(treeController.reviewTreeFollowUp, req, res);

    expect(saveTask).toHaveBeenCalled();
    expect(awardEcoPoints).toHaveBeenCalledWith('u1', 35, 'tree-follow-up-verified', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('GET my trees returns summary', async () => {
    PlantedTree.aggregate.mockResolvedValue([
      { _id: 'pt1', species: { co2AbsorptionPerYear: 20 }, followUps: [] },
      { _id: 'pt2', species: { co2AbsorptionPerYear: 15 }, followUps: [] }
    ]);

    const req = { user: { id: 'u1' } };
    const res = createRes();

    await run(treeController.getMyTrees, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: 2,
        summary: expect.objectContaining({ totalTrees: 2, co2CapacityPerYear: 35 })
      })
    );
  });
});
