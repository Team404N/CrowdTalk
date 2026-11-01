// Categorised notifications: Discussions, Resources, Invites (plus security alerts).
import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { request } from '../services/api';
import { ROUTES, MOCK_NOTIFICATIONS } from '../utils/constants';

const TABS = [['all', 'All'], ['discussion', 'Discussions'], ['resource', 'Resources'], ['invite', 'Invites']];
const ICONS = { discussion: '💬', resource: '📚', invite: '✉️', security: '🔒' };

export default function Notifications() {
  const [list, setList] = useState(null);
  const [tab, setTab] = useState('all');

  useEffect(() => { request('get', ROUTES.NOTIFICATIONS, null, MOCK_NOTIFICATIONS).then(setList); }, []);

  const markAllRead = async () => {
    setList(list.map((n) => ({ ...n, read: true })));
    request('put', `${ROUTES.NOTIFICATIONS}/read-all`, {}, {}).catch(() => {});
  };

  if (!list) return <Loader />;
  const shown = tab === 'all' ? list : list.filter((n) => n.type === tab);

  return (
    <>
      <div className="row between wrap"><h1>Notifications</h1><button className="btn outline" onClick={markAllRead}>Mark all as read</button></div>
      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>)}
      </div>
      {shown.length ? shown.map((n) => (
        <div key={n.id} className={`card row notif ${n.read ? '' : 'unread'}`}>
          <span aria-hidden="true">{ICONS[n.type]}</span>
          <div><p>{n.text}</p><p className="muted small">{n.time}</p></div>
        </div>
      )) : <p className="muted">You're all caught up.</p>}
    </>
  );
}
