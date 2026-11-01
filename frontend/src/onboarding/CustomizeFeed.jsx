// Onboarding step 4: join suggested communities, then finish and go to /home.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../services/api';
import { ROUTES, MOCK_COMMUNITIES } from '../utils/constants';

export default function CustomizeFeed() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [chosen, setChosen] = useState([]);

  useEffect(() => { request('get', ROUTES.COMMUNITIES, null, MOCK_COMMUNITIES).then((l) => setList(l.filter((c) => !c.isPrivate))); }, []);
  const toggle = (id) => setChosen(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id]);

  const finish = async () => {
    const answers = { ...JSON.parse(localStorage.getItem('onboarding') || '{}'), communities: chosen };
    await request('post', ROUTES.ONBOARDING, answers, {}).catch(() => {});
    localStorage.removeItem('onboarding');
    navigate('/home');
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <p className="muted small">Step 4 of 4</p><h1>Customize your feed</h1>
        {list.map((c) => (
          <label className="row between setting" key={c.id}>
            <span><strong>{c.name}</strong><br /><span className="muted small">{c.description}</span></span>
            <input type="checkbox" checked={chosen.includes(c.id)} onChange={() => toggle(c.id)} />
          </label>
        ))}
        <div className="row"><button className="btn" onClick={finish}>Finish</button><button className="btn outline" onClick={finish}>Skip</button></div>
      </div>
    </div>
  );
}
