import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ErrorsList from './components/ErrorsList';
import AdminPanel from './components/AdminPanel';

function App() {
  const [token, setToken] = React.useState('');

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  React.useEffect(() => {
    // Автоматический вход с дефолтным токеном для admin admin
    const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTY4NjY3NjY2NiwiZXhwIjoxNjg2NjgwMjY2fQ.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567abc890def12'; // Замените на реальный токен
    setToken(defaultToken);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/errors"
          element={<ErrorsList token={token} onLogout={handleLogout} />}
        />
        <Route
          path="/admin"
          element={token ? <AdminPanel token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/errors" />} />
      </Routes>
    </Router>
  );
}

export default App;
