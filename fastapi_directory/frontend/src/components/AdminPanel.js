import React from 'react';
import AdminPanelUsers from './AdminPanelUsers';
import AdminPanelErrors from './AdminPanelErrors';

function AdminPanel({ token, onLogout }) {
  // Здесь можно добавить управление пользователями, ошибками и логами
  return (
    <div>
      <h2>Панель администратора</h2>
      <AdminPanelUsers token={token} />
      <AdminPanelErrors token={token} />
      <button onClick={onLogout}>Выйти</button>
    </div>
  );
}

export default AdminPanel;
