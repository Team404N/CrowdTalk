// Full discussion thread with nested comments. Only community members can comment.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES, MOCK_POSTS, MOCK_COMMENTS, MOCK_COMMUNITIES } from '../utils/constants';
import { validateRequired } from '../utils/validators';

// Recursive component: renders a comment and its replies
function Comment({ comment, depth = 0 }) {
  return (
    <div className="comment" style={{ marginLeft: Math.min(depth, 4) * 20 }}>
      <p className="small muted">@{comment.author} • {comment.createdAt}</p>
      <p>{comment.text}</p>
      {comment.replies?.map((r) => <Comment key={r.id} comment={r} depth={depth + 1} />)}
    </div>
  );
}

export default function PostDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [canComment, setCanComment] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    request('get', `${ROUTES.POSTS}/${id}`, null, () => MOCK_POSTS.find((p) => p.id === id) || false).then(async (p) => {
      setPost(p);
      if (!p) return;
      const [c, communities] = await Promise.all([
        request('get', `${ROUTES.POSTS}/${id}/comments`, null, MOCK_COMMENTS),
        request('get', ROUTES.COMMUNITIES, null, MOCK_COMMUNITIES),
      ]);
      setComments(c);
      setCanComment(!!communities.find((x) => x.id === p.communityId)?.joined);
    });
  }, [id]);

  const add = async (e) => {
    e.preventDefault();
    const err = validateRequired(text, 'Comment');
    setError(err);
    if (err) return;
    const fallback = { id: `cm${Date.now()}`, author: user.username, text, createdAt: 'just now', replies: [] };
    const created = await request('post', `${ROUTES.POSTS}/${id}/comments`, { text }, fallback).catch(() => null);
    if (!created) return setError('Could not post your comment.');
    setComments([...comments, { ...fallback, ...created }]); setText('');
  };

  if (post === null) return <Loader />;
  if (post === false) return <p>Discussion not found.</p>;

  return (
    <>
      <PostCard post={post} />
      <section className="card">
        <h2>Comments ({comments.length})</h2>
        {comments.map((c) => <Comment key={c.id} comment={c} />)}
        {canComment ? (
          <form onSubmit={add}>
            {error && <div className="alert error" role="alert">{error}</div>}
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." aria-label="Comment" />
            <button className="btn">Comment</button>
          </form>
        ) : <div className="alert warning">Join this community to comment.</div>}
      </section>
    </>
  );
}
