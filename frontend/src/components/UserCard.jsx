// Profile summary card. Pass action buttons as children.
import defaultAvatar from '../assets/images/default-avatar.png';

export default function UserCard({ user, children }) {
  return (
    <div className="card row between wrap">
      <div className="row">
        <img className="avatar" src={user.avatar || defaultAvatar} alt="" />
        <div>
          <strong>{user.name}</strong>
          <p className="muted small">@{user.username} • {user.email}</p>
          {user.bio && <p className="small">{user.bio}</p>}
        </div>
      </div>
      <div className="row">{children}</div>
    </div>
  );
}
