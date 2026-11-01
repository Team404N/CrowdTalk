// 6-digit numeric OTP input with a 60-second resend countdown.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { request } from '../services/api';
import { ROUTES } from '../utils/constants';

export default function VerifyOTP() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const email = sessionStorage.getItem('pendingEmail') || '';
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [msg, setMsg] = useState(null);

  // countdown timer
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setMsg({ type: 'error', text: 'Enter the 6-digit code.' });
    try {
      await verifyOtp(email, otp);
      navigate('/onboarding/basic');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Invalid or expired code.' });
    }
  };

  const resend = async () => {
    try {
      await request('post', ROUTES.RESEND_OTP, { email }, {});
      setSeconds(60); setMsg({ type: 'success', text: 'A new code was sent.' });
    } catch { setMsg({ type: 'error', text: 'Could not resend the code.' }); }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Verify your email</h1>
        <p className="muted">Enter the 6-digit code sent to {email || 'your email'}.</p>
        {msg && <div className={`alert ${msg.type}`} role="alert">{msg.text}</div>}
        <input className="otp" inputMode="numeric" maxLength={6} value={otp} aria-label="6-digit code"
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="••••••" />
        <button className="btn block">Verify</button>
        <button type="button" className="btn outline block" onClick={resend} disabled={seconds > 0}>
          {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
        </button>
      </form>
    </div>
  );
}
