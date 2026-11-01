// Sticky top bar: menu button (mobile), logo, search, notification bell + profile dropdown.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES, MOCK_NOTIFICATIONS } from '../utils/constants';
import logo from '../assets/images/logo.png';
import defaultAvatar from '../assets/images/default-avatar.png';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    request('get', ROUTES.NOTIFICATIONS, null, MOCK_NOTIFICATIONS)
      .then((list) => setUnread(list.filter((n) => !n.read).length))
      .catch(() => setUnread(0));
  }, []);

  const search = (e) => { e.preventDefault(); if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query)}`); };
  const signOut = () => { logout(); navigate('/'); };

  return (
    <header className="navbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Toggle menu">☰</button>
      <Link to="/home" className="brand row"><img src={logo} alt="" width="28" height="28" /><span>Discussify</span></Link>
      <form className="nav-search" onSubmit={search}><SearchBar value={query} onChange={setQuery} /></form>
      <Link to="/notifications" className="bell" aria-label={`Notifications, ${unread} unread`}>
        🔔{unread > 0 && <span className="badge-count">{unread}</span>}
      </Link>
      <div className="dropdown">
        <button className="icon-btn" onClick={() => setMenu(!menu)} aria-haspopup="true" aria-expanded={menu}>
          <img className="avatar sm" src={user?.avatar || defaultAvatar} alt="Profile menu" />
        </button>
        {menu && (
          <div className="dropdown-menu card" onClick={() => setMenu(false)}>
            <strong>{user?.name}</strong>
            <Link to="/profile">My profile</Link>
            <Link to="/profile/edit">Edit profile</Link>
            <Link to="/settings">Settings</Link>
            <button className="link-btn" onClick={signOut}>Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}
