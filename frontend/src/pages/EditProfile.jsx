// Edit profile. Email is permanently read-only. Avatar must be an image <= 2MB.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES } from '../utils/constants';
import { validateImage, validateRequired } from '../utils/validators';
import defaultAvatar from '../assets/images/default-avatar.png';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name || '', bio: user.bio || '' });
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [msg, setMsg] = useState(null);

  const pickFile = (e) => {
    const file = e.target.files[0];
    const err = validateImage(file);
    if (err) { setMsg({ type: 'error', text: err }); e.target.value = ''; return; }
    setMsg(null);
    if (file) { const reader = new FileReader(); reader.onload = () => setAvatar(reader.result); reader.readAsDataURL(file); }
  };

  const save = async (e) => {
    e.preventDefault();
    const err = validateRequired(form.name, 'Name');
    if (err) return setMsg({ type: 'error', text: err });
    try {
      await request('put', `${ROUTES.USERS}/me`, { ...form, avatar }, {});
      updateUser({ ...form, avatar });
      navigate('/profile');
    } catch { setMsg({ type: 'error', text: 'Could not save your profile.' }); }
  };

  return (
    <form className="card narrow" onSubmit={save}>
      <h1>Edit profile</h1>
      {msg && <div className={`alert ${msg.type}`} role="alert">{msg.text}</div>}
      <div className="row">
        <img className="avatar lg" src={avatar || defaultAvatar} alt="Your avatar" />
        <label className="field">Avatar (max 2MB)<input type="file" accept="image/*" onChange={pickFile} /></label>
      </div>
      <label className="field">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="field">Email (cannot be changed)<input value={user.email} readOnly disabled /></label>
      <label className="field">Bio<textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
      <div className="row"><button className="btn">Save changes</button><button type="button" className="btn outline" onClick={() => navigate('/profile')}>Cancel</button></div>
    </form>
  );
}
