import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ForgetPassword from './components/ForgetPassword';
import Reset from './components/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import './App.css';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
        {/* <Route path="/admin-dashboard" element={<Dashboard />} /> */}
        <Route path='/forgotpassword' element={<ForgetPassword />} />
        <Route path='/reset-password' element={<Reset />} />
        
        <Route path="/" element={<Navigate to="/login" />} />
        
      </Routes>
    </Router>
  );
}

export default App;