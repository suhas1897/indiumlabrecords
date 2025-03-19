import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// https://labrecords.onrender.com

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://labrecordsbackend.onrender.com', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid credentials');
    }
  };
  

  return (
    <div className="login-container">
      <img src='https://res.cloudinary.com/dcggiwav8/image/upload/v1742386187/xqvlntnphywafdza7foi.png'/>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <li style={{ listStyle: 'none' }}><button onClick={() => navigate('/register')}>Register</button></li>
      <button onClick={() => navigate('/forgotpassword')}>Forgot Password?</button>
    </div>
  );
}

export default Login;
