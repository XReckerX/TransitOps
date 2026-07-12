const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  
  // Handle file downloads (CSV, PDF)
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
  }

  if (contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
}

export const api = {
  get: (endpoint) => request(endpoint, 'GET'),
  post: (endpoint, body) => request(endpoint, 'POST', body),
  put: (endpoint, body) => request(endpoint, 'PUT', body),
  delete: (endpoint) => request(endpoint, 'DELETE'),
};
