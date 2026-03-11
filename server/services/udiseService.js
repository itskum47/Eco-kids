const http = require('http');
const https = require('https');
const { URL } = require('url');
const School = require('../models/School');

const isValidUdise = (udiseCode) => /^\d{11}$/.test(udiseCode);

const requestJson = (requestUrl, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(requestUrl);
    const transport = url.protocol === 'https:' ? https : http;

    const req = transport.request(
      {
        method: 'GET',
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        headers: {
          Accept: 'application/json',
          ...headers
        },
        timeout: 6000
      },
      (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`UDISE API responded with status ${res.statusCode}`));
          }

          try {
            const parsed = JSON.parse(data || '{}');
            resolve(parsed);
          } catch (parseError) {
            reject(new Error('Invalid JSON received from UDISE API'));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('UDISE API request timed out'));
    });

    req.on('error', reject);
    req.end();
  });
};

const normalizeSchoolRecord = (payload = {}) => {
  const data = payload.school || payload.data || payload;
  if (!data || typeof data !== 'object') {
    return null;
  }

  return {
    name: data.name || data.schoolName || '',
    district: data.district || '',
    state: data.state || '',
    schoolCategory: data.schoolCategory || data.category || '',
    managementType: data.managementType || data.management || '',
    addressLine: data.addressLine || data.address || '',
    isActive: typeof data.isActive === 'boolean' ? data.isActive : true
  };
};

const verifyViaExternalApi = async (udiseCode) => {
  const apiBase = process.env.UDISE_API_URL;
  if (!apiBase) {
    return null;
  }

  const apiKey = process.env.UDISE_API_KEY;
  const requestUrl = `${apiBase.replace(/\/$/, '')}/schools/${udiseCode}`;
  const headers = apiKey ? { 'x-api-key': apiKey } : {};

  const response = await requestJson(requestUrl, headers);
  const school = normalizeSchoolRecord(response);

  if (!school || !school.name) {
    return {
      found: false,
      source: 'udise_api',
      school: null
    };
  }

  return {
    found: true,
    source: 'udise_api',
    school
  };
};

const verifyViaLocalRegistry = async (udiseCode) => {
  const school = await School.findOne({
    $or: [{ udiseCode }, { code: udiseCode }]
  }).lean();

  if (!school) {
    return {
      found: false,
      source: 'local_registry',
      school: null
    };
  }

  return {
    found: true,
    source: 'local_registry',
    school: {
      name: school.name,
      district: school.district,
      state: school.state,
      schoolCategory: school.schoolCategory || '',
      managementType: school.managementType || '',
      addressLine: school.addressLine || '',
      isActive: school.isActive
    }
  };
};

const verifySchoolByUdise = async (udiseCode) => {
  if (!isValidUdise(udiseCode)) {
    throw new Error('Valid 11-digit UDISE code is required');
  }

  try {
    const externalResult = await verifyViaExternalApi(udiseCode);
    if (externalResult) {
      return externalResult;
    }
  } catch (_) {
    // Fallback to local registry if external verification is unavailable.
  }

  return verifyViaLocalRegistry(udiseCode);
};

module.exports = {
  isValidUdise,
  verifySchoolByUdise
};
