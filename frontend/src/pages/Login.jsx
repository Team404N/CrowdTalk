// Sign-in form. On success: token + user saved to localStorage (via AuthContext) -> /home.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { validateEmail, validateRequired } from '../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = { email: validateEmail(form.email), password: validateRequired(form.password, 'Password') };
    setErrors(errs);
    if (errs.email || errs.password) return;
    setLoading(true); setBanner('');
    try {
      await login(form.email, form.password);
      navigate('/home');
    } catch (err) {
      setBanner(err.response?.status === 401 ? 'Email or password is incorrect.' : err.response?.data?.message || 'Could not log in. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        {banner && <div className="alert error" role="alert">{banner}</div>}
        <label className="field">Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </label>
        <label className="field">Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={!!errors.password} />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </label>
        <Link to="/login" className="small" onClick={(e) => { e.preventDefault(); setBanner('Password reset is not available yet.'); }}>Forgot password?</Link>
        <button className="btn block" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        <p className="muted small">New here? <Link to="/signup">Create an account</Link></p>
        <p className="muted small">Demo tip: with the backend off, any valid email works; start it with "admin" for the admin view.</p>
      </form>
    </div>
  );
}
