import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const API_URL = 'https://labrecordsbackend.onrender.com'
  // const API_URL = 'http://localhost:5000'

  // const handleLogin = async () => {
  //   try {
  //     const res = await axios.post('https://labrecordsbackend.onrender.com', { email, password });
  //     if (res.data.token) {
  //       localStorage.setItem('token', res.data.token);
  //       navigate('/dashboard');
  //     } else {
  //       alert('Login failed. Please check your credentials.');
  //     }
  //   } catch (err) {
  //     alert(err.response?.data?.error || 'Invalid credentials');
  //   }
  // };



  // const handleLogin = async () => {
  //   try {
  //     const res = await axios.post('http://localhost:5000/login', { email, password });
  //     if (res.data.token) {
  //       localStorage.setItem('token', res.data.token);
  //       navigate('/dashboard');
  //     } else {
  //       alert('Login failed. Please check your credentials.');
  //     }
  //   } catch (err) {
  //     alert(err.response?.data?.error || 'Invalid credentials');
  //   }
  // };


  // In your login component
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem("token", response.data.token);
    navigate("/dashboard"); // Redirect to ChemicalPage
  } catch (error) {
    console.error(error);
  }
};
  

  return (
    <div className="login-container">
      <img 
    src="https://res.cloudinary.com/dcggiwav8/image/upload/v1742466457/Alchemira/efpj7hd9qeczldekojn1.png" 
    alt="CIMS Logo" 
    style={{ display: 'block', margin: '0 auto' }} 
  />
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
