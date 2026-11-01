// Onboarding step 1: avatar upload (<= 2MB) and display name.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { validateImage, validateRequired } from '../utils/validators';
import defaultAvatar from '../assets/images/default-avatar.png';

// Onboarding answers are kept in localStorage until the last step
export const saveStep = (data) =>
  localStorage.setItem('onboarding', JSON.stringify({ ...JSON.parse(localStorage.getItem('onboarding') || '{}'), ...data }));

export default function BasicInfo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');

  const pick = (e) => {
    const file = e.target.files[0];
    const err = validateImage(file);
    setError(err);
    if (err) { e.target.value = ''; return; }
    if (file) { const r = new FileReader(); r.onload = () => setAvatar(r.result); r.readAsDataURL(file); }
  };

  const next = (e) => {
    e.preventDefault();
    const err = validateRequired(name, 'Display name');
    if (err) return setError(err);
    saveStep({ name, avatar }); navigate('/onboarding/about');
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={next}>
        <p className="muted small">Step 1 of 4</p><h1>Basic info</h1>
        {error && <div className="alert error" role="alert">{error}</div>}
        <img className="avatar lg" src={avatar || defaultAvatar} alt="Avatar preview" />
        <label className="field">Avatar (max 2MB)<input type="file" accept="image/*" onChange={pick} /></label>
        <label className="field">Display name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div className="row"><button className="btn">Next</button><button type="button" className="btn outline" onClick={() => navigate('/onboarding/about')}>Skip</button></div>
      </form>
    </div>
  );
}
