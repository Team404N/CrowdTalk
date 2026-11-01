// Explore communities + "Create Community" modal (name, description, public/private).
import { useEffect, useState } from 'react';
import CommunityCard from '../components/CommunityCard';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { request } from '../services/api';
import { ROUTES, MOCK_COMMUNITIES } from '../utils/constants';
import { validateRequired } from '../utils/validators';
import useAuth from '../hooks/useAuth';

export default function Communities() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isPrivate: false });
  const [error, setError] = useState('');

  useEffect(() => {
    request('get', ROUTES.COMMUNITIES, null, MOCK_COMMUNITIES).then(setList).finally(() => setLoading(false));
  }, []);

  // Optimistic Join / Leave
  const toggle = async (c) => {
    setList(list.map((x) => (x.id === c.id ? { ...x, joined: !x.joined, members: x.members + (x.joined ? -1 : 1) } : x)));
    try { await request('post', `${ROUTES.COMMUNITIES}/${c.id}/${c.joined ? 'leave' : 'join'}`, {}, {}); }
    catch { setList(list); }
  };

  const create = async (e) => {
    e.preventDefault();
    const err = validateRequired(form.name, 'Name') || validateRequired(form.description, 'Description');
    setError(err);
    if (err) return;
    const fallback = { id: `c${Date.now()}`, ...form, members: 1, joined: true, posts: 0, memberList: [user.username, user.email] };
    try {
      const created = await request('post', ROUTES.COMMUNITIES, form, fallback);
      setList([{ ...fallback, ...created, joined: true }, ...list]);
      setOpen(false); setForm({ name: '', description: '', isPrivate: false });
    } catch (e2) { setError(e2.response?.data?.message || 'Could not create community.'); }
  };

  const shown = list.filter((c) => `${c.name} ${c.description}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="row between wrap"><h1>Communities</h1><button className="btn" onClick={() => setOpen(true)}>Create community</button></div>
      <SearchBar value={query} onChange={setQuery} placeholder="Search communities..." />
      {loading ? <Loader type="skeleton" /> : <div className="grid">{shown.map((c) => <CommunityCard key={c.id} community={c} onToggle={toggle} />)}</div>}
      {open && (
        <Modal title="Create community" onClose={() => setOpen(false)}>
          <form onSubmit={create}>
            {error && <div className="alert error" role="alert">{error}</div>}
            <label className="field">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="field">Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="row"><input type="checkbox" checked={form.isPrivate} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} /> Make this community private (invite only)</label>
            <button className="btn block">Create</button>
          </form>
        </Modal>
      )}
    </>
  );
}
