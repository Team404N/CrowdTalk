// Onboarding step 3: pick interest tags.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStep } from './BasicInfo';
import { INTERESTS } from '../utils/constants';

export default function Interests() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState([]);
  const toggle = (t) => setPicked(picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t]);

  const next = () => { saveStep({ interests: picked }); navigate('/onboarding/feed'); };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <p className="muted small">Step 3 of 4</p><h1>Pick your interests</h1>
        <div className="row wrap">
          {INTERESTS.map((t) => (
            <button type="button" key={t} className={`chip ${picked.includes(t) ? 'active' : ''}`} aria-pressed={picked.includes(t)} onClick={() => toggle(t)}>{t}</button>
          ))}
        </div>
        <div className="row"><button className="btn" onClick={next}>Next</button><button className="btn outline" onClick={() => navigate('/onboarding/feed')}>Skip</button></div>
      </div>
    </div>
  );
}
