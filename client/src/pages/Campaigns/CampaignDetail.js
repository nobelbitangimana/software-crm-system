import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CampaignDetail = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Campaign Detail Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This page will show detailed campaign analytics and management options.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/campaigns')}>
        Back to Campaigns
      </Button>
    </Box>
  );
};

export default CampaignDetail;