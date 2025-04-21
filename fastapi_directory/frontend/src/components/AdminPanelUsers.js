import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPanelUsers({ token }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [realname, setRealname] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(3); // По умолчанию обычный пользователь
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers([response.data]); // Для примера, можно расширить для списка пользователей
      } catch (err) {
        setError('Ошибка при загрузке пользователей');
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/roles/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(response.data);
      } catch (err) {
        setError('Ошибка при загрузке ролей');
      }
    };

    fetchUsers();
    fetchRoles();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/users/', {
        username,
        realname,
        password,
        role_id: roleId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers([...users, response.data]);
      setUsername('');
      setRealname('');
      setPassword('');
      setRoleId(3);
    } catch (err) {
      setError('Ошибка при создании пользователя');
    }
  };

  return (
    <div>
      <h3>Управление пользователями</h3>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Настоящее имя"
          value={realname}
          onChange={(e) => setRealname(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))}>
          {roles.map((role, index) => (
            <option key={index} value={index + 1}>{role}</option>
          ))}
        </select>
        <button type="submit">Создать пользователя</button>
      </form>
      <h4>Список пользователей</h4>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username} ({user.realname}) - Роль: {user.role?.name || 'Не назначена'}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanelUsers;
