// Dynamic search across communities and discussions. Reads ?q= from the URL.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CommunityCard from '../components/CommunityCard';
import PostCard from '../components/PostCard';
import { request } from '../services/api';
import { ROUTES, MOCK_COMMUNITIES, MOCK_POSTS } from '../utils/constants';

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    request('get', ROUTES.COMMUNITIES, null, MOCK_COMMUNITIES).then(setCommunities);
    request('get', ROUTES.POSTS, null, MOCK_POSTS).then(setPosts);
  }, []);

  // keep input in sync when the navbar search changes the URL
  useEffect(() => { setQuery(params.get('q') || ''); }, [params]);

  const onChange = (v) => { setQuery(v); setParams(v ? { q: v } : {}); };
  const match = (text) => text.toLowerCase().includes(query.toLowerCase());
  const toggle = (c) => setCommunities(communities.map((x) => (x.id === c.id ? { ...x, joined: !x.joined } : x)));

  const cs = communities.filter((c) => match(`${c.name} ${c.description}`));
  const ps = posts.filter((p) => match(`${p.title} ${p.body} ${p.tags.join(' ')}`));

  return (
    <>
      <h1>Explore</h1>
      <SearchBar value={query} onChange={onChange} />
      <h2>Communities ({cs.length})</h2>
      <div className="grid">{cs.map((c) => <CommunityCard key={c.id} community={c} onToggle={toggle} />)}</div>
      <h2>Discussions ({ps.length})</h2>
      {ps.map((p) => <PostCard key={p.id} post={p} />)}
      {!cs.length && !ps.length && <p className="muted">No results for "{query}". Try a different keyword.</p>}
    </>
  );
}
