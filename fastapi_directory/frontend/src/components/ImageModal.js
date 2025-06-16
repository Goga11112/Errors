import React from 'react';
import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ImageModal({ open, onClose, imageUrl, alt, onPrev, onNext }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: '#84a59d' }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0, textAlign: 'center', position: 'relative', backgroundColor: '#2a2f4a' }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 8,
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          <IconButton aria-label="previous" onClick={onPrev} size="large" sx={{ color: '#f2a365' }}>
            <ArrowBackIosNewIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <img
          src={imageUrl}
          alt={alt}
          style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: 8,
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          <IconButton aria-label="next" onClick={onNext} size="large" sx={{ color: '#f2a365' }}>
            <ArrowForwardIosIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ImageModal;
