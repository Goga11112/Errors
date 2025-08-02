 import React, { useEffect, useState, useRef } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

function AdminPanelErrors({ token }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingError, setEditingError] = useState(null);
  const [errorName, setErrorName] = useState('');
  const [description, setDescription] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const maxImages = 5;
  const inputFileRef = useRef(null);

  useEffect(() => {
    loadErrors();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      window.addEventListener('paste', handlePaste);
    } else {
      window.removeEventListener('paste', handlePaste);
    }
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [modalOpen, imageFiles]);

  const loadErrors = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.get(`${API_BASE_URL}/errors/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setErrors(response.data);
    } catch (err) {
      setErrorMsg(`Ошибка при загрузке ошибок: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setEditingError(null);
    setErrorName('');
    setDescription('');
    setSolutionDescription('');
    setImageFiles([]);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > maxImages) {
      alert(`Можно загрузить не более ${maxImages} изображений`);
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (event) => {
    if (!modalOpen) return;
    const items = event.clipboardData.items;
    const filesFromPaste = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
          filesFromPaste.push(file);
        }
      }
    }
    if (filesFromPaste.length > 0) {
      if (filesFromPaste.length + imageFiles.length > maxImages) {
        alert(`Можно загрузить не более ${maxImages} изображений`);
        return;
      }
      setImageFiles(prev => [...prev, ...filesFromPaste]);
    }
  };

  const uploadNewImages = async (errorId) => {
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await axios.post(`${API_BASE_URL}/errors/${errorId}/images/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (err) {
        console.error('Ошибка при загрузке изображения:', err);
        throw err;
      }
    }
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!errorName.trim()) {
      setErrorMsg('Название ошибки обязательно');
      return;
    }
    if (!editingError && imageFiles.length === 0) {
      setErrorMsg('Необходимо загрузить хотя бы одно изображение');
      return;
    }
    try {
      if (editingError) {
        // Update error details without images
        const response = await axios.put(`${API_BASE_URL}/errors/${editingError.id}`, {
          name: errorName,
          description,
          solution_description: solutionDescription,
          images: editingError.images?.map(img => img.image_url) || [],
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Upload new images if any
        if (imageFiles.length > 0) {
          await uploadNewImages(editingError.id);
        }
        // Reload updated error with images
        const updatedErrorResponse = await axios.get(`${API_BASE_URL}/errors/${editingError.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setErrors(errors.map(err => (err.id === editingError.id ? updatedErrorResponse.data : err)));
      } else {
        // Create new error with images
        const formData = new FormData();
        formData.append('name', errorName);
        formData.append('description', description);
        formData.append('solution_description', solutionDescription);
        imageFiles.forEach(file => {
          formData.append('files', file);
        });
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.post(`${API_BASE_URL}/errors/`, formData, config);
        setErrors([...errors, response.data]);
      }
      setImageFiles([]);
      handleCloseModal();
    } catch (err) {
      if (err.response) {
        const detail = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
        setErrorMsg(`Ошибка при сохранении ошибки: ${err.response.status} ${detail || err.response.statusText}`);
      } else if (err.request) {
        setErrorMsg('Ошибка: сервер не отвечает');
      } else {
        setErrorMsg(`Ошибка: ${err.message}`);
      }
    }
  };

  const handleEdit = (err) => {
    setEditingError(err);
    setErrorName(err.name);
    setDescription(err.description || '');
    setSolutionDescription(err.solution_description || '');
    setImageFiles([]);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это изображение?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/errors/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingError) {
        const newImages = editingError.images.filter(img => img.id !== imageId);
        setEditingError({ ...editingError, images: newImages });
      }
      // Also update the main errors list
      setErrors(prevErrors => 
        prevErrors.map(err => 
          err.id === editingError?.id 
            ? { ...err, images: err.images.filter(img => img.id !== imageId) }
            : err
        )
      );
    } catch (err) {
      alert('Ошибка при удалении изображения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить ошибку?')) return;
    setErrorMsg('');
    try {
      await axios.delete(`${API_BASE_URL}/errors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setErrors(errors.filter(err => err.id !== id));
    } catch (err) {
      if (err.response) {
        setErrorMsg(`Ошибка при удалении ошибки: ${err.response.status} ${err.response.data.detail || err.response.statusText}`);
      } else if (err.request) {
        setErrorMsg('Ошибка: сервер не отвечает');
      } else {
        setErrorMsg(`Ошибка: ${err.message}`);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#f2a365' }}>Управление ошибками</Typography>
      <Button
        variant="contained"
        onClick={handleOpenModal}
        sx={{
          mb: 2,
          backgroundColor: '#f2a365',
          color: '#2a2f4a',
          '&:hover': { backgroundColor: '#d18c4a' },
          fontWeight: '700',
        }}
      >
        Добавить ошибку
      </Button>
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
        <Typography sx={{ color: '#eaeaea' }}>Загрузка...</Typography>
      ) : (
        <div>
          {errors.length === 0 ? (
            <Typography sx={{ color: '#eaeaea' }}>Список ошибок пуст</Typography>
          ) : (
            errors.map((err) => (
              <Accordion
                key={err.id}
                sx={{
                  backgroundColor: '#2a2f4a',
                  color: '#eaeaea',
                  border: '1px solid #f2a365',
                  mb: 1,
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#f2a365' }} />}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography sx={{ flexGrow: 1 }}>{err.name}</Typography>
                  <div onClick={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()}>
                    <IconButton aria-label="edit" onClick={() => handleEdit(err)} sx={{ color: '#f2a365' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => handleDelete(err.id)} sx={{ color: '#f2a365' }}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#1b1f33', color: '#eaeaea' }}>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{err.description}</Typography>
                  {err.images && err.images.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {err.images.map((img) => (
                        <Box key={img.id} sx={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={`${encodeURI(img.image_url)}`}
                            alt={`Error illustration ${img.id}`}
                            style={{ maxWidth: '30%', maxHeight: 200, objectFit: 'contain' }}
                          />
                          <IconButton
                            size="small"
                            aria-label="delete image"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              backgroundColor: 'rgba(255,255,255,0.7)',
                              '&:hover': { backgroundColor: 'rgba(255,0,0,0.8)', color: 'white' },
                            }}
                            onClick={() => handleDeleteImage(img.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Typography sx={{ fontStyle: 'italic', color: '#84a59d', mt: 2 }}>
                    Решение: {err.solution_description || 'Нет описания решения'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </div>
      )}

          <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#f2a365' }}>{editingError ? 'Редактировать ошибку' : 'Добавить ошибку'}</DialogTitle>
            <DialogContent sx={{ backgroundColor: '#2a2f4a' }}>
              <TextField
                autoFocus
                margin="dense"
                label="Название ошибки *обязательное поле"
                fullWidth
                value={errorName}
                onChange={(e) => setErrorName(e.target.value)}
                required
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
                label="Описание ошибки"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                label="Описание решения"
                fullWidth
                multiline
                rows={3}
                value={solutionDescription}
                onChange={(e) => setSolutionDescription(e.target.value)}
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
              
              {/* Existing images when editing */}
              {editingError && editingError.images && editingError.images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#f2a365', mb: 1 }}>
                    Существующие изображения:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {editingError.images.map((img) => (
                      <Box key={img.id} sx={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={`${encodeURI(img.image_url)}`}
                          alt={`Error illustration ${img.id}`}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <IconButton
                          size="small"
                          aria-label="delete image"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': { backgroundColor: 'rgba(255,0,0,0.9)', color: 'white' },
                            width: 24,
                            height: 24,
                            minHeight: 24,
                          }}
                          onClick={() => handleDeleteImage(img.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              <input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg"
                onChange={handleFileChange}
                style={{ marginTop: 16 }}
                ref={inputFileRef}
              />
              {imageFiles.length > 0 && (
                <List>
                  {imageFiles.map((file, index) => (
                    <ListItem key={index} secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => removeImageFile(index)} sx={{ color: '#f2a365' }}>
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemText primary={file.name} sx={{ color: '#eaeaea' }} />
                    </ListItem>
                  ))}
                </List>
              )}
              <Typography variant="body2" sx={{ mt: 1, color: '#84a59d' }}>
                Вы можете вставлять скриншоты напрямую через Ctrl+V
              </Typography>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#2a2f4a' }}>
              <Button onClick={handleCloseModal} sx={{ color: '#f2a365' }}>
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  backgroundColor: '#f2a365',
                  color: '#2a2f4a',
                  '&:hover': { backgroundColor: '#d18c4a' },
                  fontWeight: '700',
                }}
              >
                {editingError ? 'Обновить' : 'Создать'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      );
    }
    
    export default AdminPanelErrors;
