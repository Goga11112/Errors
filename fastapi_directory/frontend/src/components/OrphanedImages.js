import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

function OrphanedImages({ token }) {
  const [orphanedImages, setOrphanedImages] = useState([]);
  const [failedErrors, setFailedErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFailedErrors, setLoadingFailedErrors] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorMsgFailedErrors, setErrorMsgFailedErrors] = useState('');

  useEffect(() => {
    loadOrphanedImages();
    loadFailedErrors();
  }, []);

  const loadOrphanedImages = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.get(`${API_BASE_URL}/errors/images/orphaned/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrphanedImages(response.data);
    } catch (err) {
      setErrorMsg(`Ошибка при загрузке изображений: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadFailedErrors = async () => {
    setLoadingFailedErrors(true);
    setErrorMsgFailedErrors('');
    try {
      const response = await axios.get(`${API_BASE_URL}/errors/images/failed/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFailedErrors(response.data);
    } catch (err) {
      setErrorMsgFailedErrors(`Ошибка при загрузке ошибок с незагруженными изображениями: ${err.message}`);
    } finally {
      setLoadingFailedErrors(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это изображение?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/errors/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the deleted image from the state
      setOrphanedImages(orphanedImages.filter(img => img.id !== imageId));
      // Refresh the failed errors list
      loadFailedErrors();
    } catch (err) {
      alert('Ошибка при удалении изображения');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#f2a365' }}>
        Изображения без привязки к ошибкам
      </Typography>
      <Typography variant="body1" sx={{ color: '#eaeaea', mb: 3 }}>
        Здесь отображаются изображения, которые не привязаны ни к одной ошибке. Вы можете удалить ненужные изображения.
      </Typography>
      
      {errorMsg && (
        <Typography
          sx={{
            mb: 2,
            whiteSpace: 'pre-wrap',
            color: '#ff6b6b',
            fontWeight: '700',
          }}
        >
          {errorMsg}
        </Typography>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#f2a365' }} />
        </Box>
      ) : (
        <>
          {orphanedImages.length === 0 ? (
            <Typography sx={{ color: '#eaeaea', textAlign: 'center', mt: 4 }}>
              Нет изображений без привязки к ошибкам
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {orphanedImages.map((img) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
                  <Card sx={{ backgroundColor: '#2a2f4a', color: '#eaeaea' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={img.image_url}
                      alt={`Orphaned image ${img.id}`}
                      sx={{ objectFit: 'contain' }}
                    />
                    <CardActions sx={{ justifyContent: 'center' }}>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteImage(img.id)}
                        sx={{ 
                          color: '#f2a365',
                          '&:hover': { backgroundColor: 'rgba(242, 163, 101, 0.1)' }
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
        </>
      )}

      {/* New section for errors with failed images */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#f2a365' }}>
          Ошибки с незагруженными изображениями
        </Typography>
        <Typography variant="body1" sx={{ color: '#eaeaea', mb: 3 }}>
          Здесь отображаются ошибки, в которых есть изображения, которые не удалось загрузить.
        </Typography>
        
        {errorMsgFailedErrors && (
          <Typography
            sx={{
              mb: 2,
              whiteSpace: 'pre-wrap',
              color: '#ff6b6b',
              fontWeight: '700',
            }}
          >
            {errorMsgFailedErrors}
          </Typography>
        )}
        
        {loadingFailedErrors ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress sx={{ color: '#f2a365' }} />
          </Box>
        ) : (
          <>
            {failedErrors.length === 0 ? (
              <Typography sx={{ color: '#eaeaea', textAlign: 'center', mt: 4 }}>
                Нет ошибок с незагруженными изображениями
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ backgroundColor: '#2a2f4a', mt: 2 }}>
                <Table aria-label="errors with failed images table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#f2a365', fontWeight: 'bold' }}>ID ошибки</TableCell>
                      <TableCell sx={{ color: '#f2a365', fontWeight: 'bold' }}>Название ошибки</TableCell>
                      <TableCell sx={{ color: '#f2a365', fontWeight: 'bold' }}>Незагруженные изображения</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {failedErrors.map((item, index) => (
                      <TableRow key={index} sx={{ color: '#eaeaea' }}>
                        <TableCell sx={{ color: '#eaeaea' }}>{item.error.id}</TableCell>
                        <TableCell sx={{ color: '#eaeaea' }}>{item.error.name}</TableCell>
                        <TableCell sx={{ color: '#eaeaea' }}>
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {item.failed_images.map((image, imgIndex) => (
                              <li key={imgIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ flexGrow: 1 }}>{image.image_url}</span>
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => handleDeleteImage(image.id)}
                                  sx={{ 
                                    color: '#f2a365',
                                    '&:hover': { backgroundColor: 'rgba(242, 163, 101, 0.1)' },
                                    marginLeft: '10px'
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default OrphanedImages;
