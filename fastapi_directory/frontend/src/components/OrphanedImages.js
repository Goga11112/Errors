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
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_BASE_URL = `http://localhost:8000/api`;

function OrphanedImages({ token }) {
  const [orphanedImages, setOrphanedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadOrphanedImages();
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

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это изображение?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/errors/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the deleted image from the state
      setOrphanedImages(orphanedImages.filter(img => img.id !== imageId));
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
                      image={`${API_BASE_URL.replace('/api', '')}${img.image_url}`}
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
    </Box>
  );
}

export default OrphanedImages;
