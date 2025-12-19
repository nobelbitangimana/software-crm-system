import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';

import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Companies from './pages/Companies/Companies';
import Contacts from './pages/Contacts/Contacts';
import ContactDetail from './pages/Contacts/ContactDetail';
import Deals from './pages/Deals/Deals';
import DealDetail from './pages/Deals/DealDetail';
import Campaigns from './pages/Campaigns/Campaigns';
import CampaignDetail from './pages/Campaigns/CampaignDetail';
import Tickets from './pages/Tickets/Tickets';
import TicketDetail from './pages/Tickets/TicketDetail';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';

import { checkAuth } from './store/slices/authSlice';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="companies">
            <Route index element={<Companies />} />
          </Route>
          
          <Route path="contacts">
            <Route index element={<Contacts />} />
            <Route path=":id" element={<ContactDetail />} />
          </Route>
          
          <Route path="deals">
            <Route index element={<Deals />} />
            <Route path=":id" element={<DealDetail />} />
          </Route>
          
          <Route path="campaigns">
            <Route index element={<Campaigns />} />
            <Route path=":id" element={<CampaignDetail />} />
          </Route>
          
          <Route path="tickets">
            <Route index element={<Tickets />} />
            <Route path=":id" element={<TicketDetail />} />
          </Route>
          
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Box>
  );
}

export default App;