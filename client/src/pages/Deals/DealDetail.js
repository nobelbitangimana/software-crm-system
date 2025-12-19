import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DealDetail = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Deal Detail Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This page will show detailed information about a specific deal.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/deals')}>
        Back to Deals
      </Button>
    </Box>
  );
};

export default DealDetail;