import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchCampaigns, deleteCampaign, setFilters } from '../../store/slices/campaignsSlice';
import CampaignForm from '../../components/Campaigns/CampaignForm';

const Campaigns = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { campaigns, loading, pagination, filters } = useSelector((state) => state.campaigns);
  const [showForm, setShowForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaigns(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await dispatch(deleteCampaign(id)).unwrap();
        toast.success('Campaign deleted successfully');
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/campaigns/${id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      scheduled: 'info',
      active: 'success',
      paused: 'warning',
      completed: 'primary',
    };
    return colors[status] || 'default';
  };

  const getTypeIcon = (type) => {
    const icons = {
      email: <EmailIcon />,
      social: <TrendingUpIcon />,
      landing_page: <ViewIcon />,
      drip_sequence: <PlayIcon />,
      nurture: <TrendingUpIcon />,
    };
    return icons[type] || <EmailIcon />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Marketing Campaigns</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedCampaign(null);
              setShowForm(true);
            }}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Campaign name, description..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="social">Social Media</MenuItem>
                <MenuItem value="landing_page">Landing Page</MenuItem>
                <MenuItem value="drip_sequence">Drip Sequence</MenuItem>
                <MenuItem value="nurture">Nurture</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {campaigns.map((campaign) => (
          <Grid item xs={12} sm={6} md={4} key={campaign._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getTypeIcon(campaign.type)}
                  <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }} noWrap>
                    {campaign.name}
                  </Typography>
                  <Chip
                    label={campaign.status}
                    color={getStatusColor(campaign.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {campaign.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Type: {campaign.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                </Box>

                {campaign.metrics && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Performance Metrics
                    </Typography>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Sent: {formatNumber(campaign.metrics.sent)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Opened: {formatNumber(campaign.metrics.opened)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Clicked: {formatNumber(campaign.metrics.clicked)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Revenue: {formatCurrency(campaign.metrics.revenue)}
                        </Typography>
                      </Grid>
                    </Grid>

                    {campaign.metrics.sent > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Open Rate: {((campaign.metrics.opened / campaign.metrics.sent) * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(campaign.metrics.opened / campaign.metrics.sent) * 100}
                          sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    )}
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {campaign.tags?.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Created: {formatDate(campaign.createdAt)}
                </Typography>
              </CardContent>

              <CardActions>
                <Tooltip title="View Details">
                  <IconButton size="small" onClick={() => handleView(campaign._id)}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEdit(campaign)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                {campaign.status === 'active' ? (
                  <Tooltip title="Pause">
                    <IconButton size="small" color="warning">
                      <PauseIcon />
                    </IconButton>
                  </Tooltip>
                ) : campaign.status === 'draft' || campaign.status === 'paused' ? (
                  <Tooltip title="Start">
                    <IconButton size="small" color="success">
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
                ) : null}
                
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(campaign._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {campaigns.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No campaigns found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Create your first marketing campaign to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedCampaign(null);
              setShowForm(true);
            }}
          >
            Create Campaign
          </Button>
        </Paper>
      )}

      {showForm && (
        <CampaignForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedCampaign(null);
          }}
          campaign={selectedCampaign}
        />
      )}
    </Box>
  );
};

export default Campaigns;