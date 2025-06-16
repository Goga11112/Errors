import React from 'react';
import AdminPanelUsers from './AdminPanelUsers';
import AdminPanelErrors from './AdminPanelErrors';
import { Box, Typography, Button } from '@mui/material';

function AdminPanel({ token, onLogout }) {
  // Здесь можно добавить управление пользователями, ошибками и логами
  return (
    <Box
      sx={{
        backgroundColor: '#2a2f4a',
        padding: 3,
        borderRadius: 2,
        color: '#eaeaea',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" component="h2" sx={{ color: '#f2a365', mb: 3 }}>
        Панель администратора
      </Typography>
      <AdminPanelUsers token={token} />
      <AdminPanelErrors token={token} />
      <Button
        variant="contained"
        onClick={onLogout}
        sx={{
          mt: 3,
          backgroundColor: '#f2a365',
          color: '#2a2f4a',
          fontWeight: '700',
          '&:hover': {
            backgroundColor: '#d18c4a',
          },
        }}
      >
        Выйти
      </Button>
    </Box>
  );
}

export default AdminPanel;
