// Left navigation: quick links + joined communities. Slides in on mobile.
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES, MOCK_COMMUNITIES } from '../utils/constants';

export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();
  const [joined, setJoined] = useState([]);

  useEffect(() => {
    request('get', ROUTES.COMMUNITIES, null, MOCK_COMMUNITIES)
      .then((list) => setJoined(list.filter((c) => c.joined)))
      .catch(() => setJoined([]));
  }, []);

  const links = [['/home', '🏠 Home'], ['/explore', '🧭 Explore'], ['/communities', '👥 Communities'], ['/notifications', '🔔 Notifications'], ['/profile', '👤 Profile'], ['/settings', '⚙️ Settings']];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Sidebar">
      <nav onClick={onClose}>
        {links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        {role === 'admin' && <NavLink to="/admin">🛡️ Admin</NavLink>}
      </nav>
      <h4 className="muted small">Your communities</h4>
      <nav onClick={onClose}>
        {joined.length === 0 && <span className="muted small">Join a community to see it here.</span>}
        {joined.map((c) => <NavLink key={c.id} to={`/communities/${c.id}`}># {c.name}</NavLink>)}
      </nav>
    </aside>
  );
}
