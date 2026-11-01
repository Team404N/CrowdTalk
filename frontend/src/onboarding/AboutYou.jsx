// Onboarding step 2: profession / college branch and a short bio.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStep } from './BasicInfo';

export default function AboutYou() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ profession: '', bio: '' });

  const next = (e) => { e.preventDefault(); saveStep(form); navigate('/onboarding/interests'); };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={next}>
        <p className="muted small">Step 2 of 4</p><h1>About you</h1>
        <label className="field">Profession or college branch<input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="e.g. CSE, 3rd year" /></label>
        <label className="field">Short bio<textarea rows={3} maxLength={160} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
        <div className="row"><button className="btn">Next</button><button type="button" className="btn outline" onClick={() => navigate('/onboarding/interests')}>Skip</button></div>
      </form>
    </div>
  );
}
