// Community banner + Discussions / Resources tabs + Invite and Share Resource modals.
// Private communities show a lock until the user joins; non-members get no action forms.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES, MOCK_COMMUNITIES, MOCK_POSTS, MOCK_RESOURCES } from '../utils/constants';
import { validateRequired, validateUrl } from '../utils/validators';

export default function CommunityDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [resources, setResources] = useState([]);
  const [tab, setTab] = useState('discussions');
  const [modal, setModal] = useState(null); // 'invite' | 'resource' | null
  const [invite, setInvite] = useState('');
  const [res, setRes] = useState({ title: '', url: '', description: '', category: 'Article' });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    Promise.all([
      request('get', `${ROUTES.COMMUNITIES}/${id}`, null, () => MOCK_COMMUNITIES.find((c) => c.id === id) || null),
      request('get', ROUTES.POSTS, null, MOCK_POSTS),
      request('get', ROUTES.RESOURCES, null, MOCK_RESOURCES),
    ]).then(([c, p, r]) => {
      setCommunity(c || false);
      setPosts(p.filter((x) => x.communityId === id));
      setResources(r.filter((x) => x.communityId === id));
    });
  }, [id]);

  if (community === null) return <Loader />;
  if (community === false) return <p>Community not found.</p>;

  const locked = community.isPrivate && !community.joined;
  const join = async () => {
    await request('post', `${ROUTES.COMMUNITIES}/${id}/join`, {}, {});
    setCommunity({ ...community, joined: true, members: community.members + 1 });
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    const value = invite.trim().toLowerCase().replace(/^@/, '');
    if (!value) return setMsg({ type: 'error', text: 'Enter an email or username.' });
    if (community.memberList?.some((m) => m.toLowerCase() === value)) {
      return setMsg({ type: 'warning', text: 'This user is already a member of the community.' });
    }
    try {
      await request('post', `${ROUTES.COMMUNITIES}/${id}/invite`, { identifier: value }, {});
      setMsg({ type: 'success', text: `Invitation sent to ${value}.` }); setInvite('');
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Could not send invite.' }); }
  };

  const shareResource = async (e) => {
    e.preventDefault();
    const err = validateRequired(res.title, 'Title') || validateRequired(res.url, 'Link') || validateUrl(res.url)
      || validateRequired(res.description, 'Description') || validateRequired(res.category, 'Category');
    if (err) return setMsg({ type: 'error', text: err });
    const fallback = { id: `r${Date.now()}`, communityId: id, ...res, author: user.username };
    const created = await request('post', ROUTES.RESOURCES, { ...res, communityId: id }, fallback).catch(() => null);
    if (!created) return setMsg({ type: 'error', text: 'Could not share resource.' });
    setResources([{ ...fallback, ...created }, ...resources]);
    setRes({ title: '', url: '', description: '', category: 'Article' }); setModal(null); setMsg(null);
  };

  const openModal = (name) => { setMsg(null); setModal(name); };

  return (
    <>
      <div className="card banner">
        <div className="row between wrap">
          <div>
            <h1>{community.isPrivate ? '🔒 ' : ''}{community.name}</h1>
            <p>{community.description}</p>
            <p className="muted small">{community.members.toLocaleString()} members • {community.isPrivate ? 'Private' : 'Public'}</p>
          </div>
          <div className="row">
            {!community.joined && <button className="btn" onClick={join}>Join</button>}
            {community.joined && <button className="btn outline" onClick={() => openModal('invite')}>Invite user</button>}
          </div>
        </div>
      </div>

      {locked ? (
        <div className="card center-text"><h2>🔒 This community is private</h2><p>Join to see discussions, resources and comment.</p></div>
      ) : (
        <>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'discussions'} className={tab === 'discussions' ? 'active' : ''} onClick={() => setTab('discussions')}>Discussions</button>
            <button role="tab" aria-selected={tab === 'resources'} className={tab === 'resources' ? 'active' : ''} onClick={() => setTab('resources')}>Resources</button>
          </div>
          {!community.joined && <div className="alert warning">Join this community to post, comment or share resources.</div>}
          {tab === 'discussions' && (posts.length ? posts.map((p) => <PostCard key={p.id} post={p} />) : <p className="muted">No discussions yet.</p>)}
          {tab === 'resources' && (
            <>
              {community.joined && <button className="btn" onClick={() => openModal('resource')}>Share resource</button>}
              {resources.length ? resources.map((r) => (
                <div className="card" key={r.id}>
                  <span className="tag">{r.category}</span>
                  <h3><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></h3>
                  <p>{r.description}</p><p className="muted small">Shared by @{r.author}</p>
                </div>
              )) : <p className="muted">No resources shared yet.</p>}
            </>
          )}
        </>
      )}

      {modal === 'invite' && (
        <Modal title="Invite user" onClose={() => setModal(null)}>
          <form onSubmit={sendInvite}>
            {msg && <div className={`alert ${msg.type}`} role="alert">{msg.text}</div>}
            <label className="field">Email or username<input value={invite} onChange={(e) => setInvite(e.target.value)} /></label>
            <button className="btn block">Send invite</button>
          </form>
        </Modal>
      )}
      {modal === 'resource' && (
        <Modal title="Share resource" onClose={() => setModal(null)}>
          <form onSubmit={shareResource}>
            {msg && <div className={`alert ${msg.type}`} role="alert">{msg.text}</div>}
            <label className="field">Title<input value={res.title} onChange={(e) => setRes({ ...res, title: e.target.value })} /></label>
            <label className="field">Link / URL<input value={res.url} onChange={(e) => setRes({ ...res, url: e.target.value })} placeholder="https://" /></label>
            <label className="field">Description<textarea rows={2} value={res.description} onChange={(e) => setRes({ ...res, description: e.target.value })} /></label>
            <label className="field">Category
              <select value={res.category} onChange={(e) => setRes({ ...res, category: e.target.value })}>
                <option>Article</option><option>Study Link</option><option>Media</option>
              </select>
            </label>
            <button className="btn block">Share</button>
          </form>
        </Modal>
      )}
    </>
  );
}
