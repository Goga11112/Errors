import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageModal from "./ImageModal";
import ContactInfo from "./ContactInfo";
import { TextField, Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Box } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const BASE_URL = process.env.REACT_APP_BASE_URL || '';

function ErrorsList() {
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageAlt, setModalImageAlt] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/errors/`);
      setErrors(response.data);
    } catch (err) {
      if (err.response) {
        setError(`Ошибка загрузки: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        setError("Ошибка: сервер не отвечает");
      } else {
        setError(`Ошибка: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openImageModal = (url, alt, index) => {
    setModalImageUrl(url);
    setModalImageAlt(alt);
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
    setModalImageUrl("");
    setModalImageAlt("");
    setCurrentImageIndex(0);
  };

  const showPrevImage = () => {
    if (expandedId === null) return;
    const images = errors.find((err) => err.id === expandedId)?.images || [];
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    const img = images[prevIndex];
    setModalImageUrl(`${img.image_url}`);
    setModalImageAlt(`Error illustration ${img.id}`);
    setCurrentImageIndex(prevIndex);
  };

  const showNextImage = () => {
    if (expandedId === null) return;
    const images = errors.find((err) => err.id === expandedId)?.images || [];
    const nextIndex = (currentImageIndex + 1) % images.length;
    const img = images[nextIndex];
    setModalImageUrl(`${img.image_url}`);
    setModalImageAlt(`Error illustration ${img.id}`);
    setCurrentImageIndex(nextIndex);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Ошибка: {error}</div>;
  }

  const filteredErrors = errors.filter((err) => {
    const query = searchQuery.toLowerCase();
    return (
      err.name.toLowerCase().includes(query) ||
      (err.description && err.description.toLowerCase().includes(query))
    );
  });

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2, backgroundColor: '#2a2f4a', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#f2a365' }}>
        Поиск
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Поиск по названию или описанию"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{
          marginBottom: 3,
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1b1f33',
            color: '#eaeaea',
            borderRadius: 1,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#84a59d',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f2a365',
          },
          '& input': {
            color: '#eaeaea',
          },
          '& .MuiInputLabel-root': {
            color: '#f2a365',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#f2a365',
          },
        }}
      />
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {filteredErrors.length === 0 ? (
            <Typography sx={{ color: '#eaeaea' }}>Список ошибок пуст</Typography>
          ) : (
            filteredErrors.map((err) => (
              <Accordion
                key={err.id}
                expanded={expandedId === err.id}
                onChange={() => toggleExpand(err.id)}
                sx={{
                  marginBottom: 2,
                  boxShadow: 3,
                  borderRadius: 2,
                  backgroundColor: '#2a2f4a',
                  color: '#eaeaea',
                  border: '1px solid #f2a365',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#f2a365' }} />}
                  aria-controls={`panel-content-${err.id}`}
                  id={`panel-header-${err.id}`}
                  sx={{ backgroundColor: '#1b1f33' }}
                >
                  <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>{err.name}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#1b1f33' }}>
                  <Typography sx={{ marginBottom: 2 }}>{err.description}</Typography>
                  <Typography sx={{ fontStyle: 'italic', color: '#84a59d', marginBottom: 2 }}>
                    Решение: {err.solution_description || 'Нет описания решения'}
                  </Typography>
                  {err.images && err.images.length > 0 && (
                    <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 2 }}>
                      {err.images.map((img, index) => (
                        <Box
                          key={img.id}
                          sx={{
                            flex: '0 0 auto',
                            cursor: 'pointer',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.05)' },
                            width: '400px',
                          }}
                          onClick={() =>
                            openImageModal(`${encodeURI(img.image_url)}`, `Error illustration ${img.id}`, index)
                          }
                        >
                          <img
                            src={`${encodeURI(img.image_url)}`}
                            alt={`Error illustration ${img.id}`}
                            style={{ width: '100%', height: '300px', display: 'block', objectFit: 'cover' }}
                          />
                          <Box
                            sx={{
                              padding: '8px 16px',
                              backgroundColor: '#f2a365',
                              fontSize: 16,
                              fontWeight: 'bold',
                              textAlign: 'center',
                              color: '#2a2f4a',
                            }}
                          >
                            Image {index + 1}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <ContactInfo />
        </Grid>
      </Grid>
      <ImageModal
        open={modalOpen}
        onClose={closeImageModal}
        imageUrl={modalImageUrl}
        alt={modalImageAlt}
        onPrev={showPrevImage}
        onNext={showNextImage}
      />
    </Box>
  );
}

export default ErrorsList;
