// Global auth state: user, token, role + login / signup / verifyOtp / logout.
import { createContext, useState } from 'react';
import { request } from '../services/api';
import { ROUTES, MOCK_USER } from '../utils/constants';

export const AuthContext = createContext(null);

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser());
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Save session in state + localStorage
  const persist = (t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const login = async (email, password) => {
    const data = await request('post', ROUTES.LOGIN, { email, password }, () => ({
      token: 'mock-token',
      user: { ...MOCK_USER, email, role: email.startsWith('admin') ? 'admin' : 'user' }, // try admin@x.com for the admin view
    }));
    persist(data.token, data.user);
    return data.user;
  };

  const signup = (form) => request('post', ROUTES.SIGNUP, form, { message: 'OTP sent' });

  const verifyOtp = async (email, otp) => {
    const data = await request('post', ROUTES.VERIFY_OTP, { email, otp }, () => ({
      token: 'mock-token', user: { ...MOCK_USER, email },
    }));
    persist(data.token, data.user);
    return data.user;
  };

  const updateUser = (changes) => {
    const updated = { ...user, ...changes };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role, login, signup, verifyOtp, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
