// Public landing page: hero, features and CTAs.
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const FEATURES = [
  ['👥', 'Communities', 'Create public or private spaces for your college, club or interest.'],
  ['💬', 'Discussions', 'Ask questions, upvote the best answers and reply in threads.'],
  ['📚', 'Shared resources', 'Collect articles, study links and media in one place per community.'],
  ['🔔', 'Stay updated', 'Get alerts for new discussions and resources, and choose which ones you see.'],
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="navbar">
        <span className="brand row"><img src={logo} alt="" width="28" height="28" />Discussify</span>
        <span className="spacer" />
        <Link className="btn outline" to="/login">Log in</Link>
        <Link className="btn" to="/signup">Sign up</Link>
      </header>
      <section className="hero">
        <h1>Talk with people who care about the same things you do.</h1>
        <p>Join communities, start discussions and share the resources that helped you learn.</p>
        <div className="row center">
          <Link className="btn lg" to="/signup">Create your account</Link>
          <Link className="btn outline lg" to="/login">I already have one</Link>
        </div>
      </section>
      <section className="grid features" aria-label="Features">
        {FEATURES.map(([icon, title, text]) => (
          <div className="card" key={title}><div className="feature-icon" aria-hidden="true">{icon}</div><h3>{title}</h3><p>{text}</p></div>
        ))}
      </section>
    </div>
  );
}
