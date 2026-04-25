const sendSuccess = (res, { statusCode = 200, data = null, message = null, meta = null } = {}) => {
  const payload = { success: true };

  if (message) {
    payload.message = message;
  }

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (res, { statusCode = 500, message = 'Internal server error', errors = null, meta = null } = {}) => {
  const payload = { success: false, message };

  if (errors) {
    payload.errors = errors;
  }

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};