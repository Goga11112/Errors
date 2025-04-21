import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';

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
        const response = await axios.get('/api/admin_logs/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: page + 1,
            size: rowsPerPage,
          },
        });
        setLogs(response.data.items);
        setTotalCount(response.data.total_count);
        setError('');
      } catch (err) {
        setError('Ошибка при загрузке логов');
      } finally {
        setLoading(false);
      }
    };
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
      <Typography variant="h4" gutterBottom>Логи администраторов</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="admin logs table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Пользователь</TableCell>
                <TableCell>Действие</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
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
          />
        </TableContainer>
      )}
    </div>
  );
}

export default AdminPanelLogs;
