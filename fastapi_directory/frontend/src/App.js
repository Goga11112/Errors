import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorsList from "./components/ErrorsList";
import AuthPage from "./components/AuthPage";
import HeaderMenu from "./components/HeaderMenu";
import AdminPanelErrors from "./components/AdminPanelErrors";
import AdminPanelContactInfo from "./components/AdminPanelContactInfo";
// Assuming AdminPanelLogs and Users components exist or will be created
import AdminPanelLogs from "./components/AdminPanelLogs";
import Users from "./components/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import { Box } from '@mui/material';
import OrphanedImages from "./components/OrphanedImages";


function App() {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const token = localStorage.getItem("access_token");

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch("/api/auth/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role?.name || null);
        setUserName(data.realname || null);
        setIsAdmin(data.is_admin || false);
        setIsSuperAdmin(data.is_super_admin || false);
      } else {
        setUserRole(null);
        setUserName(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    } catch (error) {
      setUserRole(null);
      setUserName(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  };

  const handleLoginSuccess = (token, name = "Admin User") => {
    localStorage.setItem("access_token", token);
    setUserName(name);
    fetchUserInfo(token);
    setShowAuth(false);
    
    // If we're on the auth-required page, redirect to home
    if (window.location.pathname === '/auth-required') {
      window.location.href = '/';
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    localStorage.removeItem("access_token");
  };

  React.useEffect(() => {
    if (token) {
      fetchUserInfo(token);
    }
  }, [token]);

  return (
    <Router>
      <HeaderMenu userRole={userRole} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} onLoginClick={() => setShowAuth(true)} />
      {showAuth ? (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onContinueAsGuest={() => setShowAuth(false)}
        />
      ) : (
        <Routes>
          <Route path="/" element={<ErrorsList />} />
          <Route 
            path="/admin/errors" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanelErrors token={token} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/logs" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <AdminPanelLogs token={token} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Users token={token} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanelErrors token={token} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/contactinfo" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanelContactInfo token={token} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orphaned-images" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <OrphanedImages token={token} />
              </ProtectedRoute>
            } 
          />
          {/* Authorization required message route */}
          <Route 
            path="/auth-required" 
            element={
              <div style={{ padding: '20px', color: '#eaeaea', textAlign: 'center' }}>
                <h2>Необходимо в начале авторизироваться</h2>
                <button 
                  onClick={() => setShowAuth(true)}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#f2a365', 
                    color: '#2a2f4a', 
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  Авторизация
                </button>
              </div>
            } 
          />
        </Routes>
      )}
      {(token || userRole) && (
        <div>
          <button onClick={handleLogout} style={{ position: "fixed", top: 10, right: 10 }}>
            Выйти
          </button>
          <footer
            style={{
              position: "fixed",
              bottom: 10,
              right: 10,
              backgroundColor: "#f0f0f0",
              padding: "5px 10px",
              borderRadius: "5px",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
              fontSize: "14px",
              color: "#333"
            }}
          >
            {userName || "Пользователь"}
          </footer>
        </div>
      )}
    </Router>
  );
}

export default App;
