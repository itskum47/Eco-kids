const crypto = require('crypto');

const COOKIE_NAME = 'csrfToken';

const cookieOptions = () => ({
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
});

const generateToken = () => crypto.randomBytes(32).toString('hex');

const ensureCsrfCookie = (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    token = generateToken();
    res.cookie(COOKIE_NAME, token, cookieOptions());
  }
  req.csrfTokenValue = token;
  next();
};

const requireCsrf = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Bearer-token API clients (mobile/scripts) are not CSRF-prone.
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return next();
  }

  const expected = req.cookies?.[COOKIE_NAME];
  const provided = req.headers['x-csrf-token'] || req.body?._csrf;

  if (!expected || !provided || expected !== provided) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  return next();
};

const getCsrfToken = (req, res) => {
  const token = req.csrfTokenValue || req.cookies?.[COOKIE_NAME] || generateToken();

  if (!req.cookies?.[COOKIE_NAME]) {
    res.cookie(COOKIE_NAME, token, cookieOptions());
  }

  return res.status(200).json({
    success: true,
    csrfToken: token
  });
};

module.exports = {
  ensureCsrfCookie,
  requireCsrf,
  getCsrfToken
};
