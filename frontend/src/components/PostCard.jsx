// Discussion card: author, time, tags, optimistic upvote and comment counter.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import { ROUTES } from '../utils/constants';

export default function PostCard({ post }) {
  const [votes, setVotes] = useState(post.upvotes);
  const [voted, setVoted] = useState(!!post.upvoted);

  // Optimistic update: change the UI first, roll back if the server rejects it.
  const toggleVote = async () => {
    const prev = { voted, votes };
    setVoted(!voted);
    setVotes(voted ? votes - 1 : votes + 1);
    try {
      await request('post', `${ROUTES.POSTS}/${post.id}/upvote`, {}, {});
    } catch {
      setVoted(prev.voted); setVotes(prev.votes);
    }
  };

  return (
    <article className="card post">
      <div className="vote">
        <button className={`icon-btn ${voted ? 'active' : ''}`} onClick={toggleVote} aria-pressed={voted} aria-label="Upvote">▲</button>
        <strong>{votes}</strong>
      </div>
      <div className="post-body">
        <p className="muted small">
          <Link to={`/communities/${post.communityId}`}>{post.community}</Link> • by @{post.author} • {post.createdAt}
        </p>
        <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
        <p>{post.body}</p>
        <div className="row wrap">
          {post.tags?.map((t) => <span className="tag" key={t}>#{t}</span>)}
          <Link className="muted small" to={`/posts/${post.id}`}>💬 {post.comments} comments</Link>
        </div>
      </div>
    </article>
  );
}
