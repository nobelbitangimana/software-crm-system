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
  PriorityHigh as PriorityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchTickets, deleteTicket, setFilters } from '../../store/slices/ticketsSlice';
import TicketForm from '../../components/Tickets/TicketForm';

const Tickets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tickets, loading, pagination, filters } = useSelector((state) => state.tickets);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchTickets(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await dispatch(deleteTicket(id)).unwrap();
        toast.success('Ticket deleted successfully');
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/tickets/${id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'error',
      in_progress: 'warning',
      pending: 'info',
      resolved: 'success',
      closed: 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      urgent: 'error',
    };
    return colors[priority] || 'default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const columns = [
    {
      field: 'ticketNumber',
      headerName: 'Ticket #',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'subject',
      headerName: 'Subject',
      width: 300,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 200,
      valueGetter: (params) => 
        params.row.customer ? `${params.row.customer.firstName} ${params.row.customer.lastName}` : 'Unknown',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          icon={<PriorityIcon />}
          label={params.value}
          color={getPriorityColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24 }}>
            {params.row.assignedTo?.firstName?.charAt(0)}
          </Avatar>
          <Typography variant="body2">
            {params.row.assignedTo ? 
              `${params.row.assignedTo.firstName} ${params.row.assignedTo.lastName}` : 
              'Unassigned'
            }
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 100,
      valueFormatter: (params) => formatDate(params.value),
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
        <Typography variant="h4">Support Tickets</Typography>
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
              setSelectedTicket(null);
              setShowForm(true);
            }}
          >
            Create Ticket
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
                placeholder="Subject, description, ticket #..."
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
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="billing">Billing</MenuItem>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="feature_request">Feature Request</MenuItem>
                <MenuItem value="bug_report">Bug Report</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={tickets}
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
        <TicketForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
        />
      )}
    </Box>
  );
};

export default Tickets;