import React, { useState, useRef } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2'; // Import SweetAlert2

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null); // Store CAPTCHA response
  const navigate = useNavigate();
  const API_URL = 'https://labrecordsbackend.onrender.com';
  const recaptchaRef = useRef(null); // Reference to reset CAPTCHA if needed

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!captchaValue) {
      Swal.fire({
        icon: 'warning',
        title: 'CAPTCHA Required',
        text: 'Please complete the CAPTCHA to proceed.',
        confirmButtonColor: '#009e85',
      });
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/login`, { 
        email, 
        password, 
        captcha: captchaValue 
      });
      localStorage.setItem("token", response.data.token);
      
      // Success alert
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome to CIMS!',
        confirmButtonColor: '#009e85',
        timer: 1500, // Auto-close after 1.5 seconds
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      console.error(error);
      // Error alert
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.error || 'Invalid credentials',
        confirmButtonColor: '#009e85',
      });
      recaptchaRef.current.reset();
      setCaptchaValue(null);
    }
  };

  const onCaptchaChange = (value) => {
    setCaptchaValue(value); // Set CAPTCHA value when completed
  };

  return (
    <div style={{
      minHeight: '100vh',
      // background: '#007367',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{
        background: '#003d36',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '500px',
        color: '#f0e0c1'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src='https://res.cloudinary.com/dcggiwav8/image/upload/v1742464649/Alchemira/i8fvli3uwr7017odgbss.png'
            alt="Logo"
            style={{ width: '150px', marginBottom: '20px' }}
          />
          <h2 style={{ 
            color: '#f0e0c1', 
            fontSize: '26px',
            margin: 0 
          }}>
            Welcome CIMS
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #f0e0c1',
              fontSize: '16px',
              background: '#005c50',
              color: '#f0e0c1',
              transition: '0.3s ease',  
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 6px rgba(240, 224, 193, 0.8)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #f0e0c1',
              fontSize: '16px',
              background: '#005c50',
              color: '#f0e0c1',
              transition: '0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 6px rgba(240, 224, 193, 0.8)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6Lctc_sqAAAAAI76DDjUE2aiOmwcocwJE5afDRAv" // Your Site Key
            onChange={onCaptchaChange}
            theme="dark"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <button
            onClick={handleLogin}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #009e85, #005c50)',
              border: 'none',
              borderRadius: '6px',
              color: '#f0e0c1',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #007367, #004c44)'}
            onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #009e85, #005c50)'}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #009e85, #005c50)',
              border: 'none',
              borderRadius: '6px',
              color: '#f0e0c1',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #007367, #004c44)'}
            onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #009e85, #005c50)'}
          >
            Register
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span
            onClick={() => navigate('/forgotpassword')}
            style={{
              color: '#f0e0c1',
              cursor: 'pointer',
              fontSize: '14px',
              transition: '0.3s ease',
              textDecoration: 'underline'
            }}
            onMouseOver={(e) => e.target.style.color = 'rgba(240, 224, 193, 0.8)'}
            onMouseOut={(e) => e.target.style.color = '#f0e0c1'}
          >
            Forgot Password?
          </span>
        </div>
      </div>
      <Footer />
    </div>
    
  );
}

export default Login;
