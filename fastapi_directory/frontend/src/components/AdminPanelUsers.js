import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function AdminPanelUsers({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [realname, setRealname] = useState('');
  const [roleId, setRoleId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/users/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
        setError('');
      } catch (err) {
        setError('Ошибка при загрузке пользователей');
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/roles/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(response.data);
      } catch (err) {
        // ignore roles fetch error
      }
    };

    const checkSuperAdmin = async () => {
      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSuperAdmin(response.data.role.name === 'Главный администратор');
      } catch (err) {
        // ignore
      }
    };

    fetchUsers();
    fetchRoles();
    checkSuperAdmin();
  }, [token]);

  const handleEditClick = (user) => {
    setEditUser(user);
    setUsername(user.username);
    setRealname(user.realname);
    setRoleId(user.role.id);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить пользователя?')) return;
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      setError('Ошибка при удалении пользователя');
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditUser(null);
    setUsername('');
    setRealname('');
    setRoleId(null);
  };

  const handleDialogSave = async () => {
    try {
      if (editUser) {
        await axios.put(`/api/users/${editUser.id}`, {
          username,
          realname,
          role_id: roleId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.map((u) => (u.id === editUser.id ? { ...u, username, realname, role: { id: roleId } } : u)));
      } else {
        await axios.post('/api/users/', {
          username,
          realname,
          role_id: roleId,
          password: 'defaultpassword', // or prompt for password
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Refresh users list
        const response = await axios.get('/api/users/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      }
      handleDialogClose();
    } catch (err) {
      setError('Ошибка при сохранении пользователя');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Пользователи</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} style={{ marginBottom: 10 }}>
        Добавить пользователя
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Имя пользователя</TableCell>
              <TableCell>Настоящее имя</TableCell>
              <TableCell>Роль</TableCell>
              {isSuperAdmin && <TableCell>Действия</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.realname}</TableCell>
                <TableCell>{user.role.name}</TableCell>
                {isSuperAdmin && (
                  <TableCell>
                    <Button variant="outlined" color="primary" onClick={() => handleEditClick(user)} style={{ marginRight: 8 }}>
                      Редактировать
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => handleDeleteClick(user.id)}>
                      Удалить
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{editUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Имя пользователя"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Настоящее имя"
            fullWidth
            value={realname}
            onChange={(e) => setRealname(e.target.value)}
          />
          {isSuperAdmin && (
            <TextField
              select
              label="Роль"
              fullWidth
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Выберите роль</option>
              {roles.map((role) => (
                <option key={role} value={role.id}>
                  {role}
                </option>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button onClick={handleDialogSave} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AdminPanelUsers;
