import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await axios.post('https://labrecordsbackend.onrender.com/forgot-password', { email });
      setMessage(res.data.data);
    } catch (error) {
      setMessage('Error sending OTP. Try again.');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleSubmit}>Send OTP</button>
      <p>{message}</p>
      <button onClick={() => navigate('/reset-password')}>Go to Reset Password</button>
    </div>
  );
}

export default ForgetPassword;
