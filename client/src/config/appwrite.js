const DEFAULT_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const DEFAULT_PROJECT_ID = '69b6ea3b0010c4b2e448';

const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT || DEFAULT_ENDPOINT).replace(/\/$/, '');
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || DEFAULT_PROJECT_ID;

async function request(path, options = {}) {
  const response = await fetch(`${endpoint}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const error = new Error(`Appwrite request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const client = {
  endpoint,
  projectId
};

export const account = {
  async createEmailToken(email) {
    const payload = {
      userId: 'unique()',
      email: String(email || '').trim().toLowerCase()
    };

    return request('/account/tokens/email', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async createSessionFromEmailToken(userId, secret) {
    const payload = {
      userId,
      secret: String(secret || '').trim()
    };

    return request('/account/sessions/token', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getSession(sessionId) {
    if (sessionId !== 'current') {
      throw new Error('Only current Appwrite session lookup is supported');
    }

    return request('/account/sessions/current', {
      method: 'GET'
    });
  }
};