import React, { useEffect, useState } from 'react';
import {
  Typography,
  IconButton,
  Box,
  Grid,
  Card,
  CardMedia,
  CardActions,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

function OrphanedImages({ token }) {
  const [orphanedImages, setOrphanedImages] = useState([]);
  const [failedErrors, setFailedErrors] = useState([]);
  const [loading, setLoading] = useState({
    orphaned: false,
    failed: false
  });
  const [error, setError] = useState({
    orphaned: '',
    failed: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (!token) {
      setError({
        orphaned: 'Требуется авторизация',
        failed: 'Требуется авторизация'
      });
      return;
    }
    fetchOrphanedImages();
    fetchFailedErrors();
  }, [token]);

  const fetchOrphanedImages = async () => {
    setLoading(prev => ({ ...prev, orphaned: true }));
    setError(prev => ({ ...prev, orphaned: '' }));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/errors/images/orphaned/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrphanedImages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(prev => ({
        ...prev,
        orphaned: `Ошибка загрузки: ${err.response?.data?.detail || err.message}`
      }));
      setOrphanedImages([]);
    } finally {
      setLoading(prev => ({ ...prev, orphaned: false }));
    }
  };

  const fetchFailedErrors = async () => {
    setLoading(prev => ({ ...prev, failed: true }));
    setError(prev => ({ ...prev, failed: '' }));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/errors/images/failed/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFailedErrors(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(prev => ({
        ...prev,
        failed: `Ошибка загрузки: ${err.response?.data?.detail || err.message}`
      }));
      setFailedErrors([]);
    } finally {
      setLoading(prev => ({ ...prev, failed: false }));
    }
  };

  const handleDelete = async (filePath) => {
  if (!window.confirm('Удалить этот файл?')) return;
  
  try {
    const encodedPath = encodeURIComponent(
      filePath.replace('/app/uploaded_images/', '')
    );
    
    await axios.delete(`${API_BASE_URL}/errors/images/delete-orphaned/${encodedPath}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setOrphanedImages(prev => prev.filter(img => img.file_path !== filePath));
    setSnackbar({
      open: true,
      message: 'Файл успешно удален',
      severity: 'success'
    });
  } catch (err) {
    setSnackbar({
      open: true,
      message: `Ошибка удаления: ${err.response?.data?.detail || err.message}`,
      severity: 'error'
    });
  }
};

  const handleDeleteImage = async (filePath) => {
    if (!window.confirm('Удалить этот файл?')) return;
    
    try {
      const encodedPath = encodeURIComponent(
        filePath.replace('/uploaded_images/', '')
      );
      
      await axios.delete(`${API_BASE_URL}/errors/images/delete-orphaned/${encodedPath}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrphanedImages(prev => prev.filter(img => img.file_path !== filePath));
      setSnackbar({
        open: true,
        message: 'Файл успешно удален',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Ошибка удаления: ${err.response?.data?.detail || err.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 1200, 
      margin: 'auto', 
      mt: 4, 
      p: 2,
      backgroundColor: '#1b1f33',
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#f2a365',
        fontWeight: 'bold',
        mb: 4,
        borderBottom: '2px solid #f2a365',
        pb: 1
      }}>
        Управление изображениями
      </Typography>

      {/* Orphaned Images Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ 
          color: '#eaeaea',
          mb: 2,
          display: 'flex',
          alignItems: 'center'
        }}>
          Бесхозные изображения
          <IconButton 
            onClick={fetchOrphanedImages}
            sx={{ ml: 1, color: '#84a59d' }}
            disabled={loading.orphaned}
          >
            {loading.orphaned ? 
              <CircularProgress size={24} sx={{ color: '#f2a365' }} /> : 
              '↻'
            }
          </IconButton>
        </Typography>

        {error.orphaned && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.orphaned}
          </Alert>
        )}

        {loading.orphaned && orphanedImages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#f2a365' }} />
          </Box>
        ) : orphanedImages.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Нет бесхозных изображений
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {orphanedImages.map((img) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={img?.id || img?.file_path}>
                <Card sx={{ 
                  backgroundColor: '#2a2f4a',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={img?.image_url || img?.file_path}
                    alt={`Orphaned image ${img?.id}`}
                    sx={{ 
                      objectFit: 'contain',
                      backgroundColor: '#1b1f33',
                      p: 1
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: '#eaeaea',
                      wordBreak: 'break-word'
                    }}>
                      {img?.file_path || 'Неизвестный файл'}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#84a59d',
                      display: 'block',
                      mt: 1
                    }}>
                      Размер: {img?.size ? `${Math.round(img.size / 1024)} KB` : 'N/A'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteImage(img.file_path)}
                      sx={{ 
                        color: '#ff6b6b',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 107, 107, 0.1)' 
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Failed Errors Section */}
      <Box>
        <Typography variant="h5" sx={{ 
          color: '#eaeaea',
          mb: 2,
          display: 'flex',
          alignItems: 'center'
        }}>
          Ошибки с отсутствующими изображениями
          <IconButton 
            onClick={fetchFailedErrors}
            sx={{ ml: 1, color: '#84a59d' }}
            disabled={loading.failed}
          >
            {loading.failed ? 
              <CircularProgress size={24} sx={{ color: '#f2a365' }} /> : 
              '↻'
            }
          </IconButton>
        </Typography>

        {error.failed && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.failed}
          </Alert>
        )}

        {loading.failed && failedErrors.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#f2a365' }} />
          </Box>
        ) : failedErrors.length === 0 ? (
          <Alert severity="info">
            Нет ошибок с отсутствующими изображениями
          </Alert>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              backgroundColor: '#2a2f4a',
              '& .MuiTableCell-root': {
                color: '#eaeaea',
                borderColor: '#3b4160'
              }
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#f2a365' }}>ID ошибки</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#f2a365' }}>Название</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#f2a365' }}>Отсутствующие изображения</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedErrors.map((item) => (
                  <TableRow key={item?.error?.id || Math.random()}>
                    <TableCell>{item?.error?.id || 'N/A'}</TableCell>
                    <TableCell>{item?.error?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {item?.failed_images?.map((img) => (
                        <Box 
                          key={img?.id || Math.random()}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            p: 1,
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 1
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flexGrow: 1,
                              wordBreak: 'break-word',
                              color: '#ff6b6b'
                            }}
                          >
                            {img?.image_url || 'Неизвестный файл'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteImage(img.image_url)}
                            sx={{ 
                              color: '#ff6b6b',
                              '&:hover': { 
                                backgroundColor: 'rgba(255, 107, 107, 0.1)' 
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default OrphanedImages;