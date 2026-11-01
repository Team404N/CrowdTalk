// Registration form with client-side validation and server error banner.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { validateEmail, validatePassword, validateRequired } from '../utils/validators';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {
      name: validateRequired(form.name, 'Name'),
      username: validateRequired(form.username, 'Username'),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: form.password === form.confirm ? '' : 'Passwords do not match.',
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true); setBanner('');
    try {
      await signup({ name: form.name, username: form.username, email: form.email, password: form.password });
      sessionStorage.setItem('pendingEmail', form.email);
      navigate('/verify-otp');
    } catch (err) {
      // e.g. 409 from the server
      setBanner(err.response?.status === 409 ? 'An account with this email already exists.' : err.response?.data?.message || 'Could not sign up. Try again.');
    } finally { setLoading(false); }
  };

  const field = (name, label, type = 'text') => (
    <label className="field">{label}
      <input name={name} type={type} value={form[name]} onChange={change} aria-invalid={!!errors[name]} />
      {errors[name] && <span className="error-text">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        {banner && <div className="alert error" role="alert">{banner}</div>}
        {field('name', 'Full name')}
        {field('username', 'Username')}
        {field('email', 'Email', 'email')}
        {field('password', 'Password', 'password')}
        {field('confirm', 'Confirm password', 'password')}
        <button className="btn block" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
        <p className="muted small">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
