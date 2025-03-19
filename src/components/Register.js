import React, { useState } from 'react';
import axios from 'axios';
import '../global.css';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is 'user'
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('https://labrecordsbackend.onrender.com/register', { name, email, password, role });
      navigate('/login');
    } catch (err) {
      alert('Error registering user');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {/* Role Selection */}
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button onClick={handleRegister}>Register</button>
      <h2>Already have an account? <button onClick={() => navigate('/login')}>Login</button></h2>
    </div>
  );
}

export default Register;
