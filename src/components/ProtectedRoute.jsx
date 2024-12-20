import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from './Loading';

// Check if user is authenticated
const isAuthenticated = async () => {
  const token = localStorage.getItem('userToken');
  if (!token) return false;

  try {
    const response = await axios.get('/check-auth', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error('Authentication check failed:', error);
    localStorage.removeItem('userToken'); // Clear invalid token
    return false;
  }
};

// Private Route Component for authenticated routes
export const PrivateRoute = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <Loading/>; // You can replace this with a proper loading component
  }

  return isAuth ? <Outlet /> : <Navigate to="/signin" replace />;
};

// Public Route Component for guest-only routes (login/signup)
export const PublicRoute = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <Loading/>; // You can replace this with a proper loading component
  }

  return !isAuth ? <Outlet /> : <Navigate to="/dashboard" replace />;
};