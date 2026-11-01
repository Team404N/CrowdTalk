// User overview with tabs: My Posts, Joined Communities, Shared Resources.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserCard from '../components/UserCard';
import PostCard from '../components/PostCard';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES, MOCK_POSTS, MOCK_COMMUNITIES, MOCK_RESOURCES } from '../utils/constants';

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState('posts');
  const [data, setData] = useState({ posts: [], communities: [], resources: [] });

  useEffect(() => {
    Promise.all([
      request('get', ROUTES.POSTS, null, MOCK_POSTS),
      request('get', ROUTES.COMMUNITIES, null, MOCK_COMMUNITIES),
      request('get', ROUTES.RESOURCES, null, MOCK_RESOURCES),
    ]).then(([p, c, r]) => setData({
      posts: p.filter((x) => x.author === user.username),
      communities: c.filter((x) => x.joined),
      resources: r.filter((x) => x.author === user.username),
    }));
  }, [user.username]);

  const tabs = [['posts', 'My Posts'], ['communities', 'Joined Communities'], ['resources', 'Shared Resources']];

  return (
    <>
      <UserCard user={user}><Link className="btn outline" to="/profile/edit">Edit profile</Link></UserCard>
      <div className="row stats">
        <div className="card stat"><strong>{data.posts.length}</strong><span>Posts</span></div>
        <div className="card stat"><strong>{data.communities.length}</strong><span>Communities</span></div>
        <div className="card stat"><strong>{data.resources.length}</strong><span>Resources</span></div>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}
      </div>
      {tab === 'posts' && (data.posts.length ? data.posts.map((p) => <PostCard key={p.id} post={p} />) : <p className="muted">You haven't posted yet.</p>)}
      {tab === 'communities' && data.communities.map((c) => <div className="card" key={c.id}><Link to={`/communities/${c.id}`}>{c.name}</Link><p className="muted small">{c.description}</p></div>)}
      {tab === 'resources' && (data.resources.length ? data.resources.map((r) => <div className="card" key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a><p className="muted small">{r.category} • {r.description}</p></div>) : <p className="muted">No resources shared yet.</p>)}
    </>
  );
}
