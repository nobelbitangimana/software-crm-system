import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TicketDetail = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ticket Detail Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This page will show detailed ticket information and conversation history.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/tickets')}>
        Back to Tickets
      </Button>
    </Box>
  );
};

export default TicketDetail;