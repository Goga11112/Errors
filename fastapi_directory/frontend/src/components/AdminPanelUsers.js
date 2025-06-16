import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Button, Dialog, DialogActions, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import AdminUserForm from './AdminUserForm';

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
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    setPassword('');
    setConfirmPassword('');
    setErrors({});
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
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    }
    if (!realname.trim()) {
      newErrors.realname = 'Настоящее имя обязательно';
    }
    if (isSuperAdmin && !roleId) {
      newErrors.roleId = 'Роль обязательна';
    }
    if (password || confirmPassword) {
      if (password.length < 6) {
        newErrors.password = 'Пароль должен быть не менее 6 символов';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDialogSave = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      if (editUser) {
        const updateData = {
          username,
          realname,
          role_id: roleId,
        };
        if (password) {
          updateData.password = password;
        }
        await axios.put(`/api/users/${editUser.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.map((u) => (u.id === editUser.id ? { ...u, username, realname, role: { id: Number(roleId) } } : u)));
      } else {
        await axios.post('/api/users/', {
          username,
          realname,
          role_id: roleId,
          password: password || 'defaultpassword', // or prompt for password
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
      <Typography variant="h4" gutterBottom sx={{ color: '#f2a365' }}>
        Пользователи
      </Typography>
      {error && (
        <Typography sx={{ color: '#ff6b6b', fontWeight: '700' }}>
          {error}
        </Typography>
      )}
      <Button
        variant="contained"
        onClick={() => {
          setEditUser(null);
          setUsername('');
          setRealname('');
          setRoleId(null);
          setPassword('');
          setConfirmPassword('');
          setErrors({});
          setOpenDialog(true);
        }}
        sx={{
          mb: 2,
          backgroundColor: '#f2a365',
          color: '#2a2f4a',
          '&:hover': { backgroundColor: '#d18c4a' },
          fontWeight: '700',
        }}
      >
        Добавить пользователя
      </Button>
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: '#2a2f4a', color: '#eaeaea' }}
      >
        <Table aria-label="users table" sx={{ color: '#eaeaea' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#f2a365' }}>Имя пользователя</TableCell>
              <TableCell sx={{ color: '#f2a365' }}>Настоящее имя</TableCell>
              <TableCell sx={{ color: '#f2a365' }}>Роль</TableCell>
              {isSuperAdmin && (
                <TableCell sx={{ color: '#f2a365' }}>Действия</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ color: '#eaeaea' }}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.realname}</TableCell>
                <TableCell>{user.role.name}</TableCell>
                {isSuperAdmin && (
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => handleEditClick(user)}
                      sx={{
                        mr: 1,
                        borderColor: '#f2a365',
                        color: '#f2a365',
                        '&:hover': {
                          backgroundColor: '#f2a365',
                          color: '#2a2f4a',
                        },
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleDeleteClick(user.id)}
                      sx={{
                        borderColor: '#f2a365',
                        color: '#f2a365',
                        '&:hover': {
                          backgroundColor: '#f2a365',
                          color: '#2a2f4a',
                        },
                      }}
                    >
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
        <DialogTitle sx={{ color: '#f2a365' }}>
          {editUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        </DialogTitle>
        <AdminUserForm
          username={username}
          setUsername={setUsername}
          realname={realname}
          setRealname={setRealname}
          roleId={roleId}
          setRoleId={setRoleId}
          roles={roles}
          isSuperAdmin={isSuperAdmin}
          errors={errors}
          setErrors={setErrors}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />
        <DialogActions sx={{ backgroundColor: '#2a2f4a' }}>
          <Button sx={{ color: '#f2a365' }} onClick={handleDialogClose}>
            Отмена
          </Button>
          <Button
            onClick={handleDialogSave}
            sx={{
              backgroundColor: '#f2a365',
              color: '#2a2f4a',
              '&:hover': { backgroundColor: '#d18c4a' },
              fontWeight: '700',
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AdminPanelUsers;
