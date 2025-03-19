import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const res = await axios.post('https://labrecordsbackend.onrender.com/reset-password', { email, otp, newPassword });
      setMessage(res.data.data);
      if (res.data.status === 'success') {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setMessage('Error resetting password. Try again.');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <button onClick={handleReset}>Reset Password</button>
      <p>{message}</p>
      <button onClick={() => navigate('/login')}>Back to Login</button>
    </div>
  );
}

export default ResetPassword;
