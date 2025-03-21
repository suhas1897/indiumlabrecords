import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useNavigate } from 'react-router-dom';
import '../global.css'; // Assuming this has some base styles; we'll add specific styles below

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is 'user'
  const [loading, setLoading] = useState(false); // Loading state for submission
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);

    // Basic client-side validation
    if (!name || !email || !password) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields (Name, Email, and Password).',
        confirmButtonColor: '#dc3545',
      });
      return;
    }

    try {
      const response = await axios.post('https://labrecordsbackend.onrender.com/register', { name, email, password, role });
      setLoading(false);

      // Success message with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Registration Submitted',
        text: response.data.details || 'Your account has been registered and is awaiting admin approval.',
        confirmButtonColor: '#28a745',
      });
      navigate('/login');
    } catch (err) {
      setLoading(false);

      // Error message with SweetAlert2
      const errorMessage = err.response?.data?.details || err.response?.data?.error || 'An unknown error occurred.';
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage,
        confirmButtonColor: '#dc3545',
      });
    }
  };

  return (
    <div className="register-container">
      <img
        src="https://res.cloudinary.com/dcggiwav8/image/upload/v1742464649/Alchemira/i8fvli3uwr7017odgbss.png"
        alt="Chemical Management System Logo"
        className="logo"
      />
      <h2>Register</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
          className="form-select"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
      </div>
      <button onClick={handleRegister} disabled={loading} className="register-btn">
        {loading ? 'Registering...' : 'Register'}
      </button>
      <p className="login-link">
        Already have an account?{' '}
        <span onClick={() => navigate('/login')} className="link-text">
          Login
        </span>
      </p>
    </div>
  );
}

export default Register;
