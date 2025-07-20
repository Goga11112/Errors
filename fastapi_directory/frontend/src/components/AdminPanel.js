import React from 'react';
import AdminPanelUsers from './AdminPanelUsers';
import AdminPanelErrors from './AdminPanelErrors';
import { Box, Typography, Button } from '@mui/material';

import React, { useEffect, useState } from 'react';
import AdminPanelUsers from './AdminPanelUsers';
import AdminPanelErrors from './AdminPanelErrors';
import { Box, Typography, Button } from '@mui/material';
import axios from 'axios';

function AdminPanel({ token, onLogout }) {
  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoleName(response.data.role.name);
      } catch (error) {
        // handle error or ignore
      }
    };
    fetchCurrentUser();
  }, [token]);

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
      {(roleName === 'Главный администратор' || roleName === 'Администратор') && (
        <AdminPanelErrors token={token} />
      )}
      {roleName === 'Главный администратор' && <AdminPanelUsers token={token} />}
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
