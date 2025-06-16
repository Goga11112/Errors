import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorsList from "./components/ErrorsList";
import AuthPage from "./components/AuthPage";
import HeaderMenu from "./components/HeaderMenu";
import AdminPanelErrors from "./components/AdminPanelErrors";
// Assuming AdminPanelLogs and Users components exist or will be created
import AdminPanelLogs from "./components/AdminPanelLogs";
import Users from "./components/Users";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const handleLoginSuccess = (token) => {
    // Здесь можно декодировать токен и получить роль пользователя
    // Для примера просто установим роль "admin"
    localStorage.setItem("access_token", token);
    setUserRole("admin");
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUserRole(null);
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
        </Routes>
      )}
      {userRole && (
        <button onClick={handleLogout} style={{ position: "fixed", top: 10, right: 10 }}>
          Выйти
        </button>
      )}
    </Router>
  );
}

export default App;
