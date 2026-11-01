// Main feed: "Start a Discussion" card + posts from joined communities, filtered by search.
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES, MOCK_POSTS, MOCK_COMMUNITIES } from '../utils/constants';
import { validateRequired } from '../utils/validators';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState({ title: '', body: '', communityId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      request('get', ROUTES.POSTS, null, MOCK_POSTS),
      request('get', ROUTES.COMMUNITIES, null, MOCK_COMMUNITIES),
    ]).then(([p, c]) => {
      const mine = c.filter((x) => x.joined);
      setJoined(mine);
      setPosts(p.filter((post) => mine.some((m) => m.id === post.communityId)));
      setDraft((d) => ({ ...d, communityId: mine[0]?.id || '' }));
    }).finally(() => setLoading(false));
  }, []);

  const publish = async (e) => {
    e.preventDefault();
    const err = validateRequired(draft.title, 'Title') || (draft.communityId ? '' : 'Join a community first.');
    setError(err);
    if (err) return;
    const community = joined.find((c) => c.id === draft.communityId);
    const fallback = { id: `p${Date.now()}`, ...draft, community: community.name, author: user.username, tags: [], upvotes: 0, comments: 0, createdAt: 'just now' };
    try {
      const created = await request('post', ROUTES.POSTS, draft, fallback);
      setPosts([{ ...fallback, ...created, community: community.name }, ...posts]);
      setDraft({ ...draft, title: '', body: '' });
    } catch { setError('Could not publish your discussion.'); }
  };

  const shown = posts.filter((p) => `${p.title} ${p.body} ${p.community}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <form className="card" onSubmit={publish}>
        <h2>Start a discussion</h2>
        {error && <div className="alert error" role="alert">{error}</div>}
        <input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-label="Title" />
        <textarea placeholder="What would you like to talk about?" rows={3} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} aria-label="Body" />
        <div className="row between wrap">
          <select value={draft.communityId} onChange={(e) => setDraft({ ...draft, communityId: e.target.value })} aria-label="Community">
            {joined.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn">Post</button>
        </div>
      </form>
      <SearchBar value={query} onChange={setQuery} placeholder="Filter your feed..." />
      {loading ? <Loader type="skeleton" /> : shown.length ? shown.map((p) => <PostCard key={p.id} post={p} />)
        : <p className="muted">No discussions found. Try another keyword or join more communities.</p>}
    </>
  );
}
