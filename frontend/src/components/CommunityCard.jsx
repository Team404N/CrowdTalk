// Community info card with member count and Join / Leave toggle.
import { Link } from 'react-router-dom';

export default function CommunityCard({ community, onToggle }) {
  return (
    <div className="card community-card">
      <div className="row between">
        <h3><Link to={`/communities/${community.id}`}>{community.name}</Link></h3>
        <span className={`badge ${community.isPrivate ? 'private' : ''}`}>{community.isPrivate ? '🔒 Private' : '🌐 Public'}</span>
      </div>
      <p>{community.description}</p>
      <div className="row between">
        <span className="muted small">{community.members.toLocaleString()} members</span>
        <button className={community.joined ? 'btn outline' : 'btn'} onClick={() => onToggle(community)}>
          {community.joined ? 'Leave' : 'Join'}
        </button>
      </div>
    </div>
  );
}
