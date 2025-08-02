import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';

function AdminPanelLogs({ token }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        console.log("Sending request with params:", {
          skip: page * rowsPerPage,
          limit: rowsPerPage
        });
        console.log("Authorization header:", `Bearer ${token}`);
        const response = await axios.get('http://localhost:8000/api/admin_logs/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            skip: page * rowsPerPage,
            limit: rowsPerPage
          },
        });
        setLogs(response.data);
        setTotalCount(1000); // Set a large number or implement total count from backend if available
        setError('');
      } catch (err) {
        const errorMessage = err.response && err.response.data && err.response.data.detail
          ? JSON.stringify(err.response.data.detail)
          : err.message;
        console.log("Error message:", errorMessage);
        setError('Ошибка при загрузке логов: ' + errorMessage);
      } finally {
        setLoading(false);
      }
    };
    console.log("Token in AdminPanelLogs:", token);
    fetchLogs();
  }, [token, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ color: '#f2a365' }}>
        Логи администраторов
      </Typography>
      {loading ? (
        <CircularProgress sx={{ color: '#f2a365' }} />
      ) : error ? (
        <Typography sx={{ color: '#ff6b6b', fontWeight: '700' }}>{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: '#2a2f4a', color: '#eaeaea' }}>
          <Table aria-label="admin logs table" sx={{ color: '#eaeaea' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#f2a365' }}>ID лога</TableCell>
                <TableCell sx={{ color: '#f2a365' }}>Администратор выполнивший действие</TableCell>
                <TableCell sx={{ color: '#f2a365' }}>Действие</TableCell>
                <TableCell sx={{ color: '#f2a365' }}>IP адрес</TableCell>
                <TableCell sx={{ color: '#f2a365' }}>Используемое приложение</TableCell>
                <TableCell sx={{ color: '#f2a365' }}>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} sx={{ color: '#eaeaea' }}>
                  <TableCell sx={{ color: '#eaeaea' }}>{log.id}</TableCell>
                  <TableCell sx={{ color: '#eaeaea' }}>{log.admin_id}</TableCell>
                  <TableCell sx={{ color: '#eaeaea' }}>{log.action}</TableCell>
                  <TableCell sx={{ color: '#eaeaea' }}>{log.ip_address || '-'}</TableCell>
                  <TableCell sx={{ color: '#eaeaea' }}>{log.user_agent || '-'}</TableCell>
                  <TableCell sx={{ color: '#eaeaea' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              color: '#eaeaea',
              backgroundColor: '#2a2f4a',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                color: '#f2a365',
              },
              '.MuiTablePagination-select': {
                color: '#f2a365',
              },
              '.MuiSvgIcon-root': {
                color: '#f2a365',
              },
              '.MuiTablePagination-actions button': {
                color: '#f2a365',
              },
            }}
          />
        </TableContainer>
      )}
    </div>
  );
}

export default AdminPanelLogs;
