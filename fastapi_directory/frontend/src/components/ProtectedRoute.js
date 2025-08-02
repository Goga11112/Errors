import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  // Listen for changes to the token in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('access_token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!token) {
        // If no token, redirect to auth-required page
        navigate('/auth-required', { replace: true, state: { from: location.pathname } });
        setLoading(false);
        return;
      }

      try {
        // Check if token is valid by calling the /me endpoint
        const response = await fetch('/api/auth/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          
          // If a specific role is required, check it
          if (requiredRole) {
            const hasRole = 
              (requiredRole === 'admin' && (userData.is_admin || userData.is_super_admin)) ||
              (requiredRole === 'super_admin' && userData.is_super_admin);
            
            if (hasRole) {
              setIsAuthorized(true);
            } else {
              // User doesn't have required role, redirect to auth-required
              navigate('/auth-required', { replace: true, state: { from: location.pathname } });
            }
          } else {
            // No specific role required, just need to be authenticated
            setIsAuthorized(true);
          }
        } else {
          // Token is invalid, remove it and redirect to auth-required
          localStorage.removeItem('access_token');
          navigate('/auth-required', { replace: true, state: { from: location.pathname } });
        }
      } catch (error) {
        // Error checking token, remove it and redirect to auth-required
        localStorage.removeItem('access_token');
        navigate('/auth-required', { replace: true, state: { from: location.pathname } });
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [token, requiredRole, navigate, location.pathname]);

  if (loading) {
    return <div style={{ color: '#eaeaea', padding: '20px' }}>Проверка авторизации...</div>;
  }

  return isAuthorized ? children : null;
};

export default ProtectedRoute;
