import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CreateUserModal from './CreateUserModal';

function AdminPanelUsers({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [editRows, setEditRows] = useState({});
  const [error, setError] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    checkSuperAdmin();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setError('');
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

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const search = filterText.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      user.realname.toLowerCase().includes(search) ||
      (user.is_admin ? 'admin' : '').includes(search) ||
      (user.is_super_admin ? 'super admin' : '').includes(search)
    );
  });

  const handleEditChange = (id, field, value) => {
    setEditRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleEditClick = (user) => {
    setEditRows((prev) => ({
      ...prev,
      [user.id]: {
        username: user.username,
        realname: user.realname,
        role_id: user.role.id,
        is_admin: user.is_admin,
        is_super_admin: user.is_super_admin,
      },
    }));
    setError('');
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

  const handleSave = async (id) => {
    const edited = editRows[id];
    if (!edited) return;

    if (!edited.username || !edited.realname || !edited.role_id) {
      setError('Имя пользователя, настоящее имя и роль обязательны');
      return;
    }

    try {
      await axios.put(
        `/api/users/${id}`,
        {
          username: edited.username,
          realname: edited.realname,
          role_id: edited.role_id,
          is_admin: edited.is_admin,
          is_super_admin: edited.is_super_admin,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                username: edited.username,
                realname: edited.realname,
                role: roles.find((r) => r.id === edited.role_id) || user.role,
                is_admin: edited.is_admin,
                is_super_admin: edited.is_super_admin,
              }
            : user
        )
      );
      setEditRows((prev) => {
        const newEditRows = { ...prev };
        delete newEditRows[id];
        return newEditRows;
      });
      setError('');
    } catch (err) {
      setError('Ошибка при сохранении пользователя');
    }
  };
    const handleCreateUser = async (userData) => {
    try {
      const response = await axios.post('/api/users/', {
        username: userData.username,
        password: userData.password,
        realname: userData.realname,
        role_id: userData.role_id,  // Make sure this matches your backend
        is_admin: userData.is_admin,
        is_super_admin: userData.is_super_admin,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers([...users, response.data]);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при создании пользователя');
      return false;
    }
  };
  const handleCancel = (id) => {
    setEditRows((prev) => {
      const newEditRows = { ...prev };
      delete newEditRows[id];
      return newEditRows;
    });
    setError('');
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ color: '#f2a365' }}>
        Пользователи
      </Typography>
      <Button
        variant="contained"
        sx={{ mb: 2, backgroundColor: '#f2a365', color: '#2a2f4a', fontWeight: '700' }}
        onClick={() => setCreateModalOpen(true)}
      >
        Создать пользователя
      </Button>
      {error && (
        <Typography sx={{ color: '#ff6b6b', fontWeight: '700', mb: 1 }}>
          {error}
        </Typography>
      )}
      <CreateUserModal
  open={createModalOpen}
  onClose={() => setCreateModalOpen(false)}
  onSave={handleCreateUser}
  roles={roles}
  token={token}
/>
      <TextField
        placeholder="Фильтр по имени, роли, статусу..."
        value={filterText}
        onChange={handleFilterChange}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          sx: {
            backgroundColor: '#1b1f33',
            color: '#eaeaea',
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#84a59d',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f2a365',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f2a365',
            },
          },
        }}
      />
      <TableContainer component={Paper} sx={{ backgroundColor: '#2a2f4a' }}>
        <Table aria-label="users table" sx={{ color: '#eaeaea' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#f2a365' }}>Имя пользователя</TableCell>
              <TableCell sx={{ color: '#f2a365' }}>Настоящее имя</TableCell>
              <TableCell sx={{ color: '#f2a365' }}>Роль</TableCell>
              <TableCell sx={{ color: '#f2a365' }}>Админ</TableCell>
              <TableCell sx={{ color: '#f2a365' }}>Супер админ</TableCell>
              <TableCell sx={{ color: '#f2a365' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => {
              const isEditing = !!editRows[user.id];
              const editData = editRows[user.id] || {};
              return (
                <TableRow key={user.id} sx={{ color: 'white' }}>
                  <TableCell sx={{ color: 'white' }}>
                    {isEditing ? (
                      <TextField
                        value={editData.username ?? user.username}
                        onChange={(e) =>
                          handleEditChange(user.id, 'username', e.target.value)
                        }
                        size="small"
                        sx={{
                          input: { color: 'white' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#84a59d',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#f2a365',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#f2a365',
                          },
                        }}
                      />
                    ) : (
                      user.username
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {isEditing ? (
                      <TextField
                        value={editData.realname ?? user.realname}
                        onChange={(e) =>
                          handleEditChange(user.id, 'realname', e.target.value)
                        }
                        size="small"
                        sx={{
                          input: { color: 'white' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#84a59d',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#f2a365',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#f2a365',
                          },
                        }}
                      />
                    ) : (
                      user.realname
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {isEditing ? (
                      <Select
                        value={editData.role_id ?? user.role.id}
                        onChange={(e) =>
                          handleEditChange(user.id, 'role_id', e.target.value)
                        }
                        size="small"
                        sx={{
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#84a59d',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#f2a365',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#f2a365',
                          },
                        }}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      user.role
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {isEditing ? (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editData.is_admin ?? user.is_admin}
                            onChange={(e) =>
                              handleEditChange(user.id, 'is_admin', e.target.checked)
                            }
                            sx={{
                              color: '#f2a365',
                              '&.Mui-checked': {
                                color: '#f2a365',
                              },
                            }}
                          />
                        }
                        label=""
                      />
                    ) : user.is_admin ? (
                      'Да'
                    ) : (
                      'Нет'
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {isEditing ? (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editData.is_super_admin ?? user.is_super_admin}
                            onChange={(e) =>
                              handleEditChange(user.id, 'is_super_admin', e.target.checked)
                            }
                            sx={{
                              color: '#f2a365',
                              '&.Mui-checked': {
                                color: '#f2a365',
                              },
                            }}
                          />
                        }
                        label=""
                      />
                    ) : user.is_super_admin ? (
                      'Да'
                    ) : (
                      'Нет'
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {isEditing ? (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSave(user.id)}
                          sx={{
                            mr: 1,
                            backgroundColor: '#f2a365',
                            color: '#2a2f4a',
                            '&:hover': { backgroundColor: '#d18c4a' },
                            fontWeight: '700',
                          }}
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleCancel(user.id)}
                          sx={{
                            color: '#f2a365',
                            borderColor: '#f2a365',
                            '&:hover': {
                              backgroundColor: '#f2a365',
                              color: '#2a2f4a',
                            },
                          }}
                        >
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditClick(user)}
                        sx={{
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
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default AdminPanelUsers;
