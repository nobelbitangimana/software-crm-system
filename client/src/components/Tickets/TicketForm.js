import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { createTicket, updateTicket } from '../../store/slices/ticketsSlice';
import { api } from '../../services/authAPI';

const schema = yup.object({
  subject: yup.string().required('Subject is required'),
  description: yup.string().required('Description is required'),
  customer: yup.string().required('Customer is required'),
  category: yup.string().required('Category is required'),
  priority: yup.string(),
  channel: yup.string(),
});

const categories = [
  { value: 'technical', label: 'Technical' },
  { value: 'billing', label: 'Billing' },
  { value: 'general', label: 'General' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const channels = [
  { value: 'email', label: 'Email' },
  { value: 'chat', label: 'Chat' },
  { value: 'phone', label: 'Phone' },
  { value: 'social', label: 'Social Media' },
  { value: 'web_form', label: 'Web Form' },
];

const statuses = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const TicketForm = ({ open, onClose, ticket }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(ticket);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      subject: '',
      description: '',
      customer: '',
      category: 'general',
      priority: 'medium',
      channel: 'web_form',
      status: 'open',
    },
  });

  useEffect(() => {
    if (ticket) {
      reset({
        ...ticket,
        customer: ticket.customer?._id || ticket.customer || '',
      });
    } else {
      reset({
        subject: '',
        description: '',
        customer: '',
        category: 'general',
        priority: 'medium',
        channel: 'web_form',
        status: 'open',
      });
    }
  }, [ticket, reset]);

  useEffect(() => {
    const fetchContacts = async () => {
      setContactsLoading(true);
      try {
        const response = await api.get('/contacts?limit=100');
        setContacts(response.data.contacts);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        setContactsLoading(false);
      }
    };

    if (open) {
      fetchContacts();
    }
  }, [open]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await dispatch(updateTicket({ id: ticket._id, data })).unwrap();
        toast.success('Ticket updated successfully');
      } else {
        await dispatch(createTicket(data)).unwrap();
        toast.success('Ticket created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Ticket' : 'Create New Ticket'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Subject"
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="customer"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    value={contacts.find(c => c._id === value) || null}
                    onChange={(event, newValue) => {
                      onChange(newValue?._id || '');
                    }}
                    options={contacts}
                    getOptionLabel={(option) => 
                      `${option.firstName} ${option.lastName} (${option.company || 'No Company'})`
                    }
                    loading={contactsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Customer"
                        error={!!errors.customer}
                        helperText={errors.customer?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Category"
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Priority"
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="channel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Channel"
                  >
                    {channels.map((channel) => (
                      <MenuItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            {isEdit && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Status"
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TicketForm;