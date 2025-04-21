import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPanelErrors({ token }) {
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState('');
  const [errorName, setErrorName] = useState('');

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const response = await axios.get('/api/errors/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setErrors(response.data);
      } catch (err) {
        setError('Ошибка при загрузке ошибок');
      }
    };
    fetchErrors();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/errors/', { name: errorName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setErrors([...errors, response.data]);
      setErrorName('');
    } catch (err) {
      setError('Ошибка при создании ошибки');
    }
  };

  return (
    <div>
      <h3>Управление ошибками</h3>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Название ошибки"
          value={errorName}
          onChange={(e) => setErrorName(e.target.value)}
          required
        />
        <button type="submit">Создать ошибку</button>
      </form>
      <h4>Список ошибок</h4>
      <ul>
        {errors.map((err) => (
          <li key={err.id}>{err.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanelErrors;
