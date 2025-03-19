import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ component: Component, adminOnly }) => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <Component />;
};

export default PrivateRoute;
    