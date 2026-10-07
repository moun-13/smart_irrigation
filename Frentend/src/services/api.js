const API_BASE_URL = 'http://localhost:8000';

function buildHeaders(token, isJson = true) {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    let message = 'Request failed.';
    if (typeof data === 'object' && data !== null && data.detail) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail.map(err => err.msg || JSON.stringify(err)).join(', ');
      } else {
        message = JSON.stringify(data.detail);
      }
    }
    throw new Error(message);
  }
  return data;
}

export const api = {
  signup: (payload) =>
    request('/auth/signup', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    }),

  logout: (token) =>
    request('/auth/logout', {
      method: 'POST',
      headers: buildHeaders(token),
    }),

  me: (token) =>
    request('/auth/me', {
      headers: buildHeaders(token, false),
    }),

  deleteAccount: (token) =>
    request('/auth/me', {
      method: 'DELETE',
      headers: buildHeaders(token, false),
    }),

  predict: (token, payload) =>
    request('/predict', {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    }),

  predictionHistory: (token) =>
    request('/predictions/history', {
      headers: buildHeaders(token, false),
    }),
};

