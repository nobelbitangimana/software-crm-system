import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { fetchContact, deleteContact } from '../../store/slices/contactsSlice';
import ContactForm from '../../components/Contacts/ContactForm';
import ActivityForm from '../../components/Activities/ActivityForm';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentContact: contact, loading } = useSelector((state) => state.contacts);
  const [tabValue, setTabValue] = useState(0);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchContact(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await dispatch(deleteContact(id)).unwrap();
        toast.success('Contact deleted successfully');
        navigate('/contacts');
      } catch (error) {
        toast.error(error);
      }
    }
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading contact..." />;
  }

  if (!contact) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Contact not found</Typography>
        <Button onClick={() => navigate('/contacts')} sx={{ mt: 2 }}>
          Back to Contacts
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, fontSize: '2rem' }}>
              {contact.firstName?.charAt(0)}{contact.lastName?.charAt(0)}
            </Avatar>
          </Grid>
          
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {contact.firstName} {contact.lastName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={contact.status}
                color={getStatusColor(contact.status)}
                sx={{ textTransform: 'capitalize' }}
              />
              <Typography variant="body2" color="text.secondary">
                Lead Score: {contact.leadScore}/100
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {contact.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2">{contact.email}</Typography>
                </Box>
              )}
              
              {contact.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">{contact.phone}</Typography>
                </Box>
              )}
              
              {contact.company && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BusinessIcon fontSize="small" />
                  <Typography variant="body2">{contact.company}</Typography>
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit Contact">
                <IconButton onClick={() => setShowEditForm(true)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete Contact">
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Activities" />
          <Tab label="Notes" />
          <Tab label="Deals" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={contact.email}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={contact.phone || 'Not provided'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Company"
                    secondary={contact.company || 'Not provided'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Position"
                    secondary={contact.position || 'Not provided'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Lead Source"
                    secondary={contact.leadSource?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Address & Social */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              
              {contact.address?.street ? (
                <Box>
                  <Typography variant="body2">{contact.address.street}</Typography>
                  <Typography variant="body2">
                    {contact.address.city}, {contact.address.state} {contact.address.zipCode}
                  </Typography>
                  <Typography variant="body2">{contact.address.country}</Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No address provided
                </Typography>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Social Profiles
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {contact.socialProfiles?.linkedin && (
                  <IconButton
                    component="a"
                    href={contact.socialProfiles.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedInIcon />
                  </IconButton>
                )}
                
                {contact.socialProfiles?.twitter && (
                  <IconButton
                    component="a"
                    href={contact.socialProfiles.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon />
                  </IconButton>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {contact.tags?.length > 0 ? (
                  contact.tags.map((tag, index) => (
                    <Chip key={index} label={tag} variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tags assigned
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Activities</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowActivityForm(true)}
            >
              Add Activity
            </Button>
          </Box>
          
          <List>
            {contact.activities?.length > 0 ? (
              contact.activities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {activity.type?.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.subject}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(activity.date)} • {activity.createdBy?.firstName} {activity.createdBy?.lastName}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < contact.activities.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No activities recorded
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          
          <List>
            {contact.notes?.length > 0 ? (
              contact.notes.map((note, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={note.content}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(note.createdAt)} • {note.createdBy?.firstName} {note.createdBy?.lastName}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < contact.notes.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No notes added
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* Forms */}
      {showEditForm && (
        <ContactForm
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          contact={contact}
        />
      )}

      {showActivityForm && (
        <ActivityForm
          open={showActivityForm}
          onClose={() => setShowActivityForm(false)}
          contactId={contact._id}
        />
      )}
    </Box>
  );
};

export default ContactDetail;