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
import { Box } from '@mui/material';


function App() {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const handleLoginSuccess = (token, name = "Admin User") => {
    // Здесь можно декодировать токен и получить роль пользователя и имя
    // Для примера просто установим роль "admin" и имя "Admin User"
    localStorage.setItem("access_token", token);
    setUserRole("admin");
    setUserName(name);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName(null);
    localStorage.removeItem("access_token");
  };

  return (
    <Router>
      <HeaderMenu userRole={userRole} onLoginClick={() => setShowAuth(true)} />
      {showAuth ? (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onContinueAsGuest={() => setShowAuth(false)}
        />
      ) : (
        <Routes>
          <Route path="/" element={<ErrorsList />} />
          <Route path="/admin/errors" element={<AdminPanelErrors />} />
          <Route path="/admin/logs" element={<AdminPanelLogs />} />
          <Route path="/users" element={<Users />} />
          <Route path="/admin" element={<AdminPanelErrors />} />
          {/* Добавьте другие маршруты по необходимости */}
          <Route path="/admin/contactinfo" element={<AdminPanelContactInfo />} />
        </Routes>
      )}
      {userRole && (
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
            {userName}
          </footer>
        </div>
      )}
    </Router>
  );
}

export default App;
