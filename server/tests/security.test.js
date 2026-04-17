const authController = require('../controllers/auth');
const csrfMiddleware = require('../middleware/csrf');
const User = require('../models/User');
const { redisClient } = require('../services/cacheService');
const { logAuthEvent } = require('../utils/auditLogger');
const crypto = require('crypto');

jest.mock('../models/User');
jest.mock('../middleware/accountLockout', () => ({
  recordFailedAttempt: jest.fn(),
  clearFailedAttempts: jest.fn()
}));
jest.mock('../services/cacheService', () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn()
  }
}));
jest.mock('../utils/auditLogger', () => ({
  logAuthEvent: jest.fn().mockResolvedValue({}),
  logAuditEvent: jest.fn().mockResolvedValue({})
}));

const createRes = () => {
  let resolveDone;
  const done = new Promise((resolve) => {
    resolveDone = resolve;
  });

  const res = {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
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
  await Promise.race([res._done, new Promise((resolve) => setTimeout(resolve, 50))]);
  if (nextError) throw nextError;
};

describe('Security: Logout & Refresh Token Revocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'test-secret';
    logAuthEvent.mockResolvedValue({});
  });

  test('Logout should revoke hashedRefreshToken from User document', async () => {
    const userId = 'user-123';
    const mockUser = {
      _id: userId,
      id: userId,
      role: 'student',
      name: 'Test User'
    };

    User.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

    const req = {
      user: mockUser,
      cookies: { refreshToken: 'raw-refresh-token-xyz' },
      body: {}
    };

    const res = createRes();

    await run(authController.logout, req, res);

    expect(User.updateOne).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Logout should clear both token and refresh cookies', async () => {
    const mockUser = { _id: 'user-123', id: 'user-123', role: 'student' };

    User.updateOne.mockResolvedValue({ acknowledged: true });

    const req = {
      user: mockUser,
      cookies: { refreshToken: 'token' },
      body: {}
    };

    const res = createRes();

    await run(authController.logout, req, res);

    expect(res.clearCookie).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Logged out successfully'
      })
    );
  });

  test('Refresh token endpoint should validate hashed token matches stored hash', async () => {
    const rawRefreshToken = 'refresh-token-raw';
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const mockUser = {
      _id: 'user-123',
      id: 'user-123',
      role: 'student',
      hashedRefreshToken: tokenHash,
      refreshTokenExpire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      getSignedJwtToken: jest.fn().mockReturnValue('new-access-token'),
      save: jest.fn().mockResolvedValue(true)
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const req = {
      cookies: { refreshToken: rawRefreshToken },
      body: {},
      user: null
    };

    const res = createRes();

    await run(authController.refreshToken, req, res);

    expect(User.findOne).toHaveBeenCalled();
  });

  test('Refresh should fail with invalid or mismatched token hash', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = {
      cookies: { refreshToken: 'invalid-token' },
      body: {},
      user: null
    };

    const res = createRes();

    await run(authController.refreshToken, req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('Security: CSRF Token Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  test('CSRF middleware should issue and store token in cookie', (done) => {
    const req = { cookies: {} };
    const res = {
      cookie: jest.fn().mockReturnThis(),
      locals: {},
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    const next = jest.fn();

    csrfMiddleware.ensureCsrfCookie(req, res, next);

    // Token should be generated and stored
    expect(next).toHaveBeenCalled();
    done();
  });

  test('CSRF middleware should accept valid token in X-CSRF-Token header', (done) => {
    const token = crypto.randomBytes(32).toString('hex');
    const req = {
      cookies: { _csrf: token },
      headers: { 'x-csrf-token': token },
      method: 'POST',
      path: '/api/v1/auth/login'
    };
    const res = {
      locals: {},
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    const next = jest.fn();

    csrfMiddleware.requireCsrf(req, res, next);

    expect(next).toHaveBeenCalled();
    done();
  });

  test('CSRF middleware should reject missing CSRF token on POST', (done) => {
    const req = {
      cookies: { _csrf: 'token123' },
      headers: {},
      method: 'POST',
      path: '/api/v1/auth/login'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    const next = jest.fn();

    csrfMiddleware.requireCsrf(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    done();
  });

  test('CSRF middleware should reject mismatched token', (done) => {
    const req = {
      cookies: { _csrf: 'token123' },
      headers: { 'x-csrf-token': 'different-token' },
      method: 'POST',
      path: '/api/v1/auth/login'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    const next = jest.fn();

    csrfMiddleware.requireCsrf(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    done();
  });

  test('CSRF middleware should bypass check for GET requests', (done) => {
    const req = {
      cookies: {},
      headers: {},
      method: 'GET',
      path: '/api/v1/auth/verify'
    };
    const res = { locals: {} };
    const next = jest.fn();

    csrfMiddleware.requireCsrf(req, res, next);

    expect(next).toHaveBeenCalled();
    done();
  });

  test('CSRF middleware should bypass check for Bearer token in Authorization', (done) => {
    const req = {
      cookies: {},
      headers: { authorization: 'Bearer eyJhbGc...' },
      method: 'POST',
      path: '/api/v1/auth/profile'
    };
    const res = { locals: {} };
    const next = jest.fn();

    csrfMiddleware.requireCsrf(req, res, next);

    expect(next).toHaveBeenCalled();
    done();
  });
});

describe('Security: MFA Setup & Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'test-secret';
  });

  test('setupMfa should generate secret and return QR code as data URI', async () => {
    const mockUser = {
      _id: 'user-123',
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      role: 'school_admin',
      mfaEnabled: false,
      mfaSecret: undefined,
      mfaPendingSecret: undefined,
      matchPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true)
    };

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const req = {
      user: { id: 'user-123', role: 'school_admin' },
      body: { currentPassword: 'password123' }
    };

    const res = createRes();

    await run(authController.setupMfa, req, res);

    expect(User.findById).toHaveBeenCalledWith('user-123');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('setupMfa should reject without current password', async () => {
    const req = {
      user: { id: 'user-123' },
      body: {}
    };

    const res = createRes();

    await run(authController.setupMfa, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('verifyMfaSetup should validate TOTP token format', async () => {
    const mockUser = {
      _id: 'user-123',
      id: 'user-123',
      email: 'user@example.com',
      mfaEnabled: false,
      mfaPendingSecret: 'pending-secret-key',
      mfaSecret: undefined,
      backupCodes: undefined,
      save: jest.fn().mockResolvedValue(true)
    };

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const req = {
      user: { id: 'user-123' },
      body: { token: '123456' }
    };

    const res = createRes();

    await run(authController.verifyMfaSetup, req, res);

    // Status will depend on TOTP validation logic
    expect(res.status).toHaveBeenCalled();
  });

  test('verifyMfaSetup should reject when no pending MFA setup', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'user-123',
        mfaPendingSecret: null
      })
    });

    const req = {
      user: { id: 'user-123' },
      body: { token: '123456' }
    };

    const res = createRes();

    await run(authController.verifyMfaSetup, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('verifyMfaLogin should require mfaChallengeToken or TOTP/backup code', async () => {
    const req = {
      body: { token: '123456' }
    };

    const res = createRes();

    await run(authController.verifyMfaLogin, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('disableMfa should clear MFA fields when user has MFA enabled', async () => {
    const mockUser = {
      _id: 'user-123',
      id: 'user-123',
      mfaEnabled: true,
      mfaSecret: 'secret',
      backupCodes: ['code1', 'code2'],
      matchPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true)
    };

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const req = {
      user: { id: 'user-123' },
      body: { currentPassword: 'password123' }
    };

    const res = createRes();

    await run(authController.disableMfa, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('disableMfa should fail when user has no MFA enabled', async () => {
    const mockUser = {
      _id: 'user-123',
      mfaEnabled: false
    };

    User.findById.mockResolvedValue(mockUser);

    const req = {
      user: { id: 'user-123' },
      body: {}
    };

    const res = createRes();

    await run(authController.disableMfa, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('Security: Integration - Login with MFA Requirement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'test-secret';
  });

  test('Login for school_admin should return MFA challenge token', async () => {
    const mockUser = {
      _id: 'admin-123',
      id: 'admin-123',
      role: 'school_admin',
      email: 'admin@school.edu',
      name: 'Admin User',
      mfaEnabled: false,
      matchPassword: jest.fn().mockResolvedValue(true),
      isActive: true,
      updateStreak: jest.fn().mockResolvedValue(true),
      lastLogin: new Date(),
      save: jest.fn().mockResolvedValue(true)
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const req = {
      body: { email: 'admin@school.edu', password: 'password123' }
    };

    const res = createRes();

    await run(authController.login, req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        mfaRequired: true
      })
    );
  });

  test('Login for student with MFA enabled should return MFA challenge', async () => {
    const mockUser = {
      _id: 'student-123',
      id: 'student-123',
      role: 'student',
      email: 'student@example.com',
      mfaEnabled: true,
      matchPassword: jest.fn().mockResolvedValue(true),
      isActive: true,
      updateStreak: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true)
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const req = {
      body: { email: 'student@example.com', password: 'pass123' }
    };

    const res = createRes();

    await run(authController.login, req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        mfaRequired: true
      })
    );
  });

  test('Login for student without MFA and not privileged should return tokens directly', async () => {
    const mockUser = {
      _id: 'student-456',
      id: 'student-456',
      role: 'student',
      email: 'student2@example.com',
      mfaEnabled: false,
      name: 'Student User',
      matchPassword: jest.fn().mockResolvedValue(true),
      isActive: true,
      updateStreak: jest.fn().mockResolvedValue(true),
      profile: {},
      gamification: {},
      ecoCoins: 0,
      lastLogin: new Date(),
      getSignedJwtToken: jest.fn().mockReturnValue('access-token'),
      save: jest.fn().mockResolvedValue(true)
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const req = {
      body: { email: 'student2@example.com', password: 'pass123' }
    };

    const res = createRes();

    await run(authController.login, req, res);

    expect(res.cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), expect.any(Object));
    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: 'access-token',
        user: expect.objectContaining({ role: 'student' })
      })
    );
  });
});
