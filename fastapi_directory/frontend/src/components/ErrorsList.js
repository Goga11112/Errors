import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, CircularProgress, Modal, Box, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function ErrorsList({ token, onLogout }) {
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 10;
  const observer = useRef();

  const lastErrorElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchErrors = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/errors/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: page,
            size: pageSize,
          },
        });
        setErrors((prev) => [...prev, ...response.data.items]);
        setHasMore(response.data.items.length > 0);
        setError('');
      } catch (err) {
        if (err.response && err.response.status === 401) {
          onLogout();
        } else {
          setError('Ошибка при загрузке ошибок');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchErrors();
  }, [token, onLogout, page]);

  const filteredErrors = errors.filter((err) =>
    err.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (error) => {
    setSelectedError(error);
  };

  const handleCloseModal = () => {
    setSelectedError(null);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Список ошибок</Typography>
      <TextField
        label="Поиск ошибок..."
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredErrors.length === 0 && !loading && <Typography>Ошибки не найдены</Typography>}
      {filteredErrors.map((err, index) => {
        if (filteredErrors.length === index + 1) {
          return (
            <Accordion key={err.id} ref={lastErrorElementRef}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-content-${err.id}`}
                id={`panel-header-${err.id}`}
              >
                <Typography>{err.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{err.description || 'Описание отсутствует'}</Typography>
                {err.images && err.images.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {err.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`Error ${err.name} image ${idx + 1}`}
                        style={{ maxWidth: '100%', marginBottom: 10 }}
                        onClick={() => handleOpenModal(img)}
                      />
                    ))}
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
          );
        } else {
          return (
            <Accordion key={err.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-content-${err.id}`}
                id={`panel-header-${err.id}`}
              >
                <Typography>{err.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{err.description || 'Описание отсутствует'}</Typography>
                {err.images && err.images.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {err.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`Error ${err.name} image ${idx + 1}`}
                        style={{ maxWidth: '100%', marginBottom: 10 }}
                        onClick={() => handleOpenModal(img)}
                      />
                    ))}
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
          );
        }
      })}
      {loading && <CircularProgress />}
      <Button variant="contained" color="secondary" onClick={onLogout} style={{ marginTop: 20 }}>
        Выйти
      </Button>

      <Modal
        open={!!selectedError}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
          }}
        >
          {selectedError && (
            <>
              <img
                src={selectedError.url}
                alt="Error detail"
                style={{ maxWidth: '100%', marginBottom: 10 }}
              />
              <Button variant="contained" onClick={handleCloseModal}>Закрыть</Button>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default ErrorsList;
