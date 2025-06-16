import React, { useEffect, useState } from "react";
import { fetchUsers, deleteUser, updateUserRole } from "../apiClient";

function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const loadUsers = () => {
    fetchUsers()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Управление пользователями</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} style={{ marginBottom: 8 }}>
            {user.username} ({user.realname}) - Роль: {user.role?.name}
            <select
              value={user.role?.name || ""}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
              style={{ marginLeft: 8 }}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
              <option value="superadmin">Главный администратор</option>
            </select>
            <button
              onClick={() => handleDelete(user.id)}
              style={{ marginLeft: 8, color: "red" }}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
