const authController = require('../controllers/auth');
const User = require('../models/User');
const { redisClient } = require('../services/cacheService');
const { sendSms } = require('../services/smsService');
const { logAuthEvent } = require('../utils/auditLogger');

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../models/ParentalConsent', () => ({}));
jest.mock('../models/ConsentRecord', () => ({}));
jest.mock('../models/School', () => ({}));
jest.mock('../services/qrCodeService', () => ({}));

jest.mock('../services/cacheService', () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn()
  }
}));

jest.mock('../services/smsService', () => ({
  sendSms: jest.fn()
}));

jest.mock('../utils/auditLogger', () => ({
  logAuthEvent: jest.fn(),
  logAuditEvent: jest.fn()
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

describe('Auth OTP Flow', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'test-secret';
    process.env.ACCESS_TOKEN_EXPIRE = '15m';
    process.env.REFRESH_TOKEN_EXPIRE = '30d';
    sendSms.mockResolvedValue({ success: true });
    logAuthEvent.mockResolvedValue({ success: true });
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('POST /send-otp rejects invalid phone', async () => {
    const req = { body: { phone: '123' } };
    const res = createRes();

    await run(authController.sendOtp, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Enter a valid Indian mobile number' })
    );
  });

  test('POST /send-otp returns 404 when user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { phone: '9876543210' } };
    const res = createRes();

    await run(authController.sendOtp, req, res);

    expect(User.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('POST /send-otp stores otp and sends sms', async () => {
    User.findOne.mockResolvedValue({ _id: 'u1' });

    const req = { body: { phone: '9876543210' } };
    const res = createRes();

    await run(authController.sendOtp, req, res);

    expect(redisClient.set).toHaveBeenCalledTimes(2);
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '9876543210', otp: expect.stringMatching(/^\d{6}$/) })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, maskedPhone: '98XXXXXX10' })
    );
  });

  test('POST /resend-otp rejects invalid phone', async () => {
    const req = { body: { phone: '111' } };
    const res = createRes();

    await run(authController.resendOtp, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Enter a valid Indian mobile number' })
    );
  });

  test('POST /resend-otp returns 404 when user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { phone: '9876543210' } };
    const res = createRes();

    await run(authController.resendOtp, req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('POST /resend-otp sends a new otp', async () => {
    User.findOne.mockResolvedValue({ _id: 'u1' });

    const req = { body: { phone: '9876543210' } };
    const res = createRes();

    await run(authController.resendOtp, req, res);

    expect(redisClient.set).toHaveBeenCalledTimes(2);
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '9876543210', otp: expect.stringMatching(/^\d{6}$/) })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'OTP resent successfully' })
    );
  });

  test('POST /verify-otp returns 400 when otp expired or missing', async () => {
    redisClient.get.mockResolvedValueOnce(null);

    const req = { body: { phone: '9876543210', otp: '123456' } };
    const res = createRes();

    await run(authController.verifyOtp, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'OTP expired' })
    );
  });

  test('POST /verify-otp returns 401 on wrong otp and increments attempts', async () => {
    redisClient.get
      .mockResolvedValueOnce('111111')
      .mockResolvedValueOnce('0');

    const req = { body: { phone: '9876543210', otp: '222222' } };
    const res = createRes();

    await run(authController.verifyOtp, req, res);

    expect(redisClient.set).toHaveBeenCalledWith('otp_attempts:9876543210', 1, 'PX', 5 * 60 * 1000);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('POST /verify-otp returns token and user on success', async () => {
    redisClient.get
      .mockResolvedValueOnce('123456')
      .mockResolvedValueOnce('0');

    const mockUser = {
      _id: 'u1',
      id: 'u1',
      role: 'student',
      name: 'Test Student',
      email: 'student@example.com',
      profile: { grade: '6' },
      gamification: {},
      ecoCoins: 0,
      isActive: true,
      getSignedJwtToken: jest.fn().mockReturnValue('access-token'),
      save: jest.fn().mockResolvedValue(true)
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const req = { body: { phone: '9876543210', otp: '123456' }, user: null };
    const res = createRes();

    await run(authController.verifyOtp, req, res);

    expect(redisClient.del).toHaveBeenCalledWith('otp:9876543210');
    expect(redisClient.del).toHaveBeenCalledWith('otp_attempts:9876543210');
    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: 'access-token',
        user: expect.objectContaining({ role: 'student', email: 'student@example.com' })
      })
    );
  });
});
