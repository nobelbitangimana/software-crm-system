import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchDeals, updateDeal, deleteDeal } from '../../store/slices/dealsSlice';
import DealForm from '../../components/Deals/DealForm';

const stageConfig = {
  lead: { label: 'Lead', color: '#e3f2fd' },
  qualified: { label: 'Qualified', color: '#f3e5f5' },
  proposal: { label: 'Proposal', color: '#fff3e0' },
  negotiation: { label: 'Negotiation', color: '#e8f5e8' },
  closed_won: { label: 'Closed Won', color: '#e8f5e8' },
  closed_lost: { label: 'Closed Lost', color: '#ffebee' },
};

const DealCard = ({ deal, index, onEdit, onDelete, onView }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Draggable draggableId={deal._id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            cursor: 'pointer',
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            boxShadow: snapshot.isDragging ? 4 : 1,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Box {...provided.dragHandleProps} sx={{ mr: 1, mt: 0.5 }}>
                <DragIcon fontSize="small" color="action" />
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                  {deal.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" noWrap>
                  {deal.contact?.firstName} {deal.contact?.lastName}
                </Typography>
                
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {formatCurrency(deal.value)}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={`${deal.probability}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  
                  {deal.expectedCloseDate && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(deal.expectedCloseDate)}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                    {deal.assignedTo?.firstName?.charAt(0)}
                  </Avatar>
                  
                  <Typography variant="caption" color="text.secondary">
                    {deal.assignedTo?.firstName} {deal.assignedTo?.lastName}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => onView(deal._id)}>
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(deal)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => onDelete(deal._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

const StageColumn = ({ stage, deals, onEdit, onDelete, onView }) => {
  const config = stageConfig[stage];
  
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(amount);
  };

  return (
    <Paper sx={{ p: 2, height: 'fit-content', minHeight: 400 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {config.label} ({deals.length})
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Total: {formatCurrency(totalValue)}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Weighted: {formatCurrency(weightedValue)}
        </Typography>
      </Box>
      
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              minHeight: 300,
              backgroundColor: snapshot.isDraggingOver ? config.color : 'transparent',
              borderRadius: 1,
              p: 1,
            }}
          >
            {deals.map((deal, index) => (
              <DealCard
                key={deal._id}
                deal={deal}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

const Deals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pipeline } = useSelector((state) => state.deals);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    dispatch(fetchDeals());
  }, [dispatch]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      await dispatch(updateDeal({
        id: draggableId,
        data: { stage: destination.droppableId }
      })).unwrap();
      
      toast.success('Deal stage updated successfully');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await dispatch(deleteDeal(id)).unwrap();
        toast.success('Deal deleted successfully');
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/deals/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sales Pipeline</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedDeal(null);
            setShowForm(true);
          }}
        >
          Add Deal
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          {Object.keys(stageConfig).map((stage) => (
            <Grid item xs={12} sm={6} md={2} key={stage}>
              <StageColumn
                stage={stage}
                deals={pipeline[stage] || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      {showForm && (
        <DealForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedDeal(null);
          }}
          deal={selectedDeal}
        />
      )}
    </Box>
  );
};

export default Deals;