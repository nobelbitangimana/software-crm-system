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
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchContacts, deleteContact, setFilters } from '../../store/slices/contactsSlice';
import ContactForm from '../../components/Contacts/ContactForm';

const Contacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { contacts, loading, pagination, filters } = useSelector((state) => state.contacts);
  const [showForm, setShowForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchContacts(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await dispatch(deleteContact(id)).unwrap();
        toast.success('Contact deleted successfully');
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/contacts/${id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      lead: 'primary',
      prospect: 'warning',
      customer: 'success',
      inactive: 'default',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar sx={{ width: 32, height: 32 }}>
          {params.row.firstName?.charAt(0)}{params.row.lastName?.charAt(0)}
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'fullName',
      headerName: 'Name',
      width: 200,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'company',
      headerName: 'Company',
      width: 200,
    },
    {
      field: 'position',
      headerName: 'Position',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'leadScore',
      headerName: 'Score',
      width: 100,
      type: 'number',
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
      valueGetter: (params) => 
        params.row.assignedTo ? `${params.row.assignedTo.firstName} ${params.row.assignedTo.lastName}` : 'Unassigned',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleView(params.row._id)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(params.row._id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Contacts</Typography>
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
              setSelectedContact(null);
              setShowForm(true);
            }}
          >
            Add Contact
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
                placeholder="Name, email, company..."
              />
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
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="prospect">Prospect</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Lead Source"
                value={filters.leadSource}
                onChange={(e) => handleFilterChange('leadSource', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="website">Website</MenuItem>
                <MenuItem value="referral">Referral</MenuItem>
                <MenuItem value="social_media">Social Media</MenuItem>
                <MenuItem value="email_campaign">Email Campaign</MenuItem>
                <MenuItem value="cold_call">Cold Call</MenuItem>
                <MenuItem value="trade_show">Trade Show</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Tags"
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                placeholder="Comma separated"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={contacts}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={pagination.total}
          page={pagination.current - 1}
          pageSize={pagination.limit}
          onPageChange={(page) => handleFilterChange('page', page + 1)}
          onPageSizeChange={(pageSize) => handleFilterChange('limit', pageSize)}
          pageSizeOptions={[10, 20, 50, 100]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Paper>

      {showForm && (
        <ContactForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedContact(null);
          }}
          contact={selectedContact}
        />
      )}
    </Box>
  );
};

export default Contacts;