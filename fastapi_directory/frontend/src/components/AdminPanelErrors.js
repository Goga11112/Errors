import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPanelErrors({ token }) {
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState('');
  const [errorName, setErrorName] = useState('');
  const [editingError, setEditingError] = useState(null);
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const maxImages = 5;

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const response = await axios.get('/api/errors/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setErrors(response.data);
      } catch (err) {
        // If error response contains validation errors, stringify them
        if (err.response && err.response.data) {
          if (typeof err.response.data === 'object') {
            setError(JSON.stringify(err.response.data, null, 2));
          } else {
            setError(err.response.data);
          }
        } else {
          setError('Ошибка при загрузке ошибок');
        }
      }
    };
    fetchErrors();
  }, [token]);

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

  const uploadImages = async (errorId) => {
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`/api/errors/${errorId}/images/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    setImageFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let response;
      if (editingError) {
        response = await axios.put(`/api/errors/${editingError.id}`, { name: errorName, description }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await uploadImages(editingError.id);
        setErrors(errors.map(err => (err.id === editingError.id ? response.data : err)));
        setEditingError(null);
      } else {
        response = await axios.post('/api/errors/', { name: errorName, description }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await uploadImages(response.data.id);
        setErrors([...errors, response.data]);
      }
      setErrorName('');
      setDescription('');
    } catch (err) {
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object') {
          setError(JSON.stringify(err.response.data, null, 2));
        } else {
          setError(err.response.data);
        }
      } else {
        setError(editingError ? 'Ошибка при обновлении ошибки' : 'Ошибка при создании ошибки');
      }
    }
  };

  const handleEdit = (err) => {
    setEditingError(err);
    setErrorName(err.name);
    setDescription(err.description || '');
    setImageFiles([]);
    setError('');
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await axios.delete(`/api/errors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setErrors(errors.filter(err => err.id !== id));
    } catch (err) {
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object') {
          setError(JSON.stringify(err.response.data, null, 2));
        } else {
          setError(err.response.data);
        }
      } else {
        setError('Ошибка при удалении ошибки');
      }
    }
  };

  const handleCancel = () => {
    setEditingError(null);
    setErrorName('');
    setDescription('');
    setImageFiles([]);
    setError('');
  };

  return (
    <div>
      <h3>Управление ошибками</h3>
      {error && <pre style={{color: 'red', whiteSpace: 'pre-wrap'}}>{error}</pre>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Название ошибки"
          value={errorName}
          onChange={(e) => setErrorName(e.target.value)}
          required
        />
        <textarea
          placeholder="Описание ошибки"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ width: '100%', marginTop: 8 }}
        />
        <input
          type="file"
          multiple
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          style={{ marginTop: 8 }}
        />
        {imageFiles.length > 0 && (
          <ul>
            {imageFiles.map((file, index) => (
              <li key={index}>
                {file.name}
                <button type="button" onClick={() => removeImageFile(index)} style={{ marginLeft: 8 }}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="submit" style={{ marginTop: 8 }}>
          {editingError ? 'Обновить ошибку' : 'Создать ошибку'}
        </button>
        {editingError && (
          <button type="button" onClick={handleCancel} style={{ marginLeft: 8, marginTop: 8 }}>
            Отмена
          </button>
        )}
      </form>
      <h4>Список ошибок</h4>
      <ul>
        {errors.map((err) => (
          <li key={err.id} style={{ marginBottom: 8 }}>
            <strong>{err.name}</strong>: {err.description}
            {err.images && err.images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {err.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={`Error illustration ${img.id}`}
                    style={{ maxWidth: '30%', maxHeight: 200, objectFit: 'contain' }}
                  />
                ))}
              </div>
            )}
            <button onClick={() => handleEdit(err)} style={{ marginLeft: 8 }}>Редактировать</button>
            <button onClick={() => handleDelete(err.id)} style={{ marginLeft: 8, color: 'red' }}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanelErrors;
