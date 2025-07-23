import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#2a2f4a',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  color: 'white',
};

function CreateUserModal({ open, onClose, token, roles, onUserCreated = () => {} }) {
  const [username, setUsername] = useState('');
  const [realname, setRealname] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (roles.length > 0) {
      setRoleId(roles[0].id);
    }
  }, [roles]);

  const handleSubmit = async () => {
    if (!username || !realname || !password || !roleId) {
      setError('Все поля обязательны для заполнения');
      return;
    }
    try {
      await axios.post(
        '/api/users/',
        {
          username,
          realname,
          password,
          role_id: roleId,
          is_admin: isAdmin,
          is_super_admin: isSuperAdmin,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setError('');
      onUserCreated();
      onClose();
      // Reset form
      setUsername('');
      setRealname('');
      setPassword('');
      setRoleId(roles.length > 0 ? roles[0].id : '');
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } catch (err) {
      console.error('Create user error:', err.response?.data || err.message || err);
      setError(err.response?.data?.detail || 'Ошибка при создании пользователя');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Создать пользователя
        </Typography>
        {error && (
          <Typography sx={{ color: '#ff6b6b', mb: 2, fontWeight: '700' }}>
            {error}
          </Typography>
        )}
        <TextField
          label="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{ sx: { color: 'white' } }}
        />
        <TextField
          label="Настоящее имя"
          value={realname}
          onChange={(e) => setRealname(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{ sx: { color: 'white' } }}
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{ sx: { color: 'white' } }}
        />
        <Select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          fullWidth
          sx={{ mb: 2, color: 'white' }}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              sx={{ color: '#f2a365', '&.Mui-checked': { color: '#f2a365' } }}
            />
          }
          label="Админ"
          sx={{ mb: 1 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isSuperAdmin}
              onChange={(e) => setIsSuperAdmin(e.target.checked)}
              sx={{ color: '#f2a365', '&.Mui-checked': { color: '#f2a365' } }}
            />
          }
          label="Супер админ"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ backgroundColor: '#f2a365', color: '#2a2f4a', fontWeight: '700' }}
          >
            Создать
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default CreateUserModal;
