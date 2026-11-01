// Central Axios client. Adds the Bearer token to every request.
// request() falls back to mock data ONLY when the backend is unreachable (no response),
// so real server errors (e.g. 409 "email exists") still reach the UI.
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 4000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function request(method, url, data, fallback) {
  try {
    const res = await api({ method, url, data });
    return res.data;
  } catch (err) {
    if (!err.response && fallback !== undefined) {
      return typeof fallback === 'function' ? fallback() : fallback;
    }
    throw err;
  }
}

export default api;
