// Responsive footer with branding and links.
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="row"><img src={logo} alt="" width="24" height="24" /><strong>Discussify</strong></div>
      <nav className="row" aria-label="Footer">
        <Link to="/explore">Explore</Link><Link to="/communities">Communities</Link><Link to="/settings">Settings</Link>
      </nav>
      <small>© {new Date().getFullYear()} Discussify. Built with the MERN stack.</small>
    </footer>
  );
}
