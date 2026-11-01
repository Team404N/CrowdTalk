// Notification preferences + Admin panel (admins only).
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES, MOCK_COMMUNITIES, MOCK_USERS } from '../utils/constants';

export default function Settings({ initialTab = 'notifications' }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState(isAdmin ? initialTab : 'notifications');
  const [prefs, setPrefs] = useState({ discussions: true, resources: true, invites: true });
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    request('get', ROUTES.COMMUNITIES, null, MOCK_COMMUNITIES).then(setCommunities);
    request('get', ROUTES.USERS, null, MOCK_USERS).then(setUsers);
  }, [isAdmin]);

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    request('put', ROUTES.SETTINGS, next, {}).catch(() => setMsg({ type: 'error', text: 'Could not save preference.' }));
  };

  const deleteCommunity = async (c) => {
    // Safeguard: communities with active discussions cannot be deleted
    if (c.posts > 0) return setMsg({ type: 'error', text: 'Cannot delete community with active discussions' });
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await request('delete', `${ROUTES.COMMUNITIES}/${c.id}`, null, {});
      setCommunities(communities.filter((x) => x.id !== c.id));
      setMsg({ type: 'success', text: `${c.name} was deleted.` });
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Could not delete community.' }); }
  };

  const deleteUser = async (u) => {
    if (u.id === user.id) return setMsg({ type: 'error', text: 'You cannot delete your own account here.' });
    if (!window.confirm(`Delete user @${u.username}?`)) return;
    await request('delete', `${ROUTES.USERS}/${u.id}`, null, {}).catch(() => {});
    setUsers(users.filter((x) => x.id !== u.id));
  };

  const labels = { discussions: 'New discussions', resources: 'New shared resources', invites: 'Community invites' };

  return (
    <>
      <h1>Settings</h1>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'notifications'} className={tab === 'notifications' ? 'active' : ''} onClick={() => setTab('notifications')}>Notifications</button>
        {isAdmin && <button role="tab" aria-selected={tab === 'admin'} className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>Admin</button>}
      </div>
      {msg && <div className={`alert ${msg.type}`} role="alert">{msg.text}</div>}

      {tab === 'notifications' && (
        <div className="card">
          {Object.keys(labels).map((k) => (
            <label className="row between setting" key={k}>{labels[k]}
              <input type="checkbox" checked={prefs[k]} onChange={() => togglePref(k)} />
            </label>
          ))}
          <label className="row between setting">Security alerts (always on)
            <input type="checkbox" checked disabled />
          </label>
        </div>
      )}

      {tab === 'admin' && isAdmin && (
        <>
          <h2>Communities</h2>
          {communities.map((c) => (
            <div className="card row between wrap" key={c.id}>
              <div><strong>{c.name}</strong><p className="muted small">{c.posts} discussions • {c.members} members</p></div>
              <button className="btn danger" onClick={() => deleteCommunity(c)}>Delete</button>
            </div>
          ))}
          <h2>Users</h2>
          {users.map((u) => (
            <div className="card row between wrap" key={u.id}>
              <div><strong>{u.name}</strong><p className="muted small">@{u.username} • {u.email} (email cannot be edited)</p></div>
              <button className="btn danger" onClick={() => deleteUser(u)}>Delete</button>
            </div>
          ))}
        </>
      )}
    </>
  );
}
