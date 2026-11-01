// Main routing configuration (react-router-dom v6).
import { Routes, Route, Outlet } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Communities from './pages/Communities';
import CommunityDetails from './pages/CommunityDetails';
import PostDetails from './pages/PostDetails';
import Notifications from './pages/Notifications';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import BasicInfo from './onboarding/BasicInfo';
import AboutYou from './onboarding/AboutYou';
import Interests from './onboarding/Interests';
import CustomizeFeed from './onboarding/CustomizeFeed';

// Shared shell for logged-in pages: navbar + collapsible sidebar + content + footer
function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Navbar onMenu={() => setOpen(!open)} />
      <div className="layout">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="main"><Outlet /></main>
      </div>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* Onboarding (4 steps) */}
      <Route path="/onboarding/basic" element={<ProtectedRoute><BasicInfo /></ProtectedRoute>} />
      <Route path="/onboarding/about" element={<ProtectedRoute><AboutYou /></ProtectedRoute>} />
      <Route path="/onboarding/interests" element={<ProtectedRoute><Interests /></ProtectedRoute>} />
      <Route path="/onboarding/feed" element={<ProtectedRoute><CustomizeFeed /></ProtectedRoute>} />

      {/* Protected, with layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/communities/:id" element={<CommunityDetails />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Settings initialTab="admin" /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
