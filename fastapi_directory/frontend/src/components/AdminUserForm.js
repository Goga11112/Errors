import React from 'react';
import { TextField, DialogContent, MenuItem } from '@mui/material';

function AdminUserForm({
  username,
  setUsername,
  realname,
  setRealname,
  roleId,
  setRoleId,
  roles,
  isSuperAdmin,
  errors,
  setErrors,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) {
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors((prev) => ({ ...prev, username: null }));
    }
  };

  const handleRealnameChange = (e) => {
    setRealname(e.target.value);
    if (errors.realname) {
      setErrors((prev) => ({ ...prev, realname: null }));
    }
  };

  const handleRoleChange = (e) => {
    setRoleId(Number(e.target.value));
    if (errors.roleId) {
      setErrors((prev) => ({ ...prev, roleId: null }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
  };

  return (
    <DialogContent sx={{ backgroundColor: '#2a2f4a' }}>
      <TextField
        autoFocus
        margin="dense"
        label="Имя пользователя"
        fullWidth
        value={username}
        onChange={handleUsernameChange}
        error={!!errors.username}
        helperText={errors.username}
        sx={{
          '& label': { color: '#f2a365' },
          '& label.Mui-focused': { color: '#f2a365' },
          '& .MuiInputBase-root': {
            color: '#eaeaea',
            backgroundColor: '#1b1f33',
            borderRadius: 1,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#84a59d',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f2a365',
          },
        }}
      />
      <TextField
        margin="dense"
        label="Настоящее имя"
        fullWidth
        value={realname}
        onChange={handleRealnameChange}
        error={!!errors.realname}
        helperText={errors.realname}
        sx={{
          '& label': { color: '#f2a365' },
          '& label.Mui-focused': { color: '#f2a365' },
          '& .MuiInputBase-root': {
            color: '#eaeaea',
            backgroundColor: '#1b1f33',
            borderRadius: 1,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#84a59d',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f2a365',
          },
        }}
      />
      {isSuperAdmin && (
        <TextField
          select
          label="Роль"
          fullWidth
          value={roleId || ''}
          onChange={handleRoleChange}
          error={!!errors.roleId}
          helperText={errors.roleId}
          sx={{
            '& label': { color: '#f2a365' },
            '& label.Mui-focused': { color: '#f2a365' },
            '& .MuiInputBase-root': {
              color: '#eaeaea',
              backgroundColor: '#1b1f33',
              borderRadius: 1,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#84a59d',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f2a365',
            },
          }}
        >
          <MenuItem value="">
            <em>Выберите роль</em>
          </MenuItem>
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      <TextField
        margin="dense"
        label="Пароль"
        type="password"
        fullWidth
        value={password}
        onChange={handlePasswordChange}
        error={!!errors.password}
        helperText={errors.password}
        sx={{
          '& label': { color: '#f2a365' },
          '& label.Mui-focused': { color: '#f2a365' },
          '& .MuiInputBase-root': {
            color: '#eaeaea',
            backgroundColor: '#1b1f33',
            borderRadius: 1,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#84a59d',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f2a365',
          },
        }}
      />
      <TextField
        margin="dense"
        label="Подтверждение пароля"
        type="password"
        fullWidth
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        sx={{
          '& label': { color: '#f2a365' },
          '& label.Mui-focused': { color: '#f2a365' },
          '& .MuiInputBase-root': {
            color: '#eaeaea',
            backgroundColor: '#1b1f33',
            borderRadius: 1,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#84a59d',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f2a365',
          },
        }}
      />
    </DialogContent>
  );
}

