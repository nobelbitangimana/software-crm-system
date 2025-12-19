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

import { createDeal, updateDeal } from '../../store/slices/dealsSlice';
import { api } from '../../services/authAPI';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  value: yup.number().required('Value is required').min(0, 'Value must be positive'),
  contact: yup.string().required('Contact is required'),
  stage: yup.string().required('Stage is required'),
  probability: yup.number().min(0).max(100),
  expectedCloseDate: yup.date(),
});

const stages = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

const DealForm = ({ open, onClose, deal }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(deal);
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
      title: '',
      description: '',
      value: 0,
      contact: '',
      stage: 'lead',
      probability: 10,
      expectedCloseDate: '',
      company: '',
    },
  });

  useEffect(() => {
    if (deal) {
      reset({
        ...deal,
        contact: deal.contact?._id || '',
        expectedCloseDate: deal.expectedCloseDate ? 
          new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        title: '',
        description: '',
        value: 0,
        contact: '',
        stage: 'lead',
        probability: 10,
        expectedCloseDate: '',
        company: '',
      });
    }
  }, [deal, reset]);

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
        await dispatch(updateDeal({ id: deal._id, data })).unwrap();
        toast.success('Deal updated successfully');
      } else {
        await dispatch(createDeal(data)).unwrap();
        toast.success('Deal created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Deal' : 'Create New Deal'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Deal Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
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
                    rows={3}
                    label="Description"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Deal Value ($)"
                    error={!!errors.value}
                    helperText={errors.value?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="probability"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Probability (%)"
                    inputProps={{ min: 0, max: 100 }}
                    error={!!errors.probability}
                    helperText={errors.probability?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="contact"
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
                        label="Contact"
                        error={!!errors.contact}
                        helperText={errors.contact?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="stage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Stage"
                    error={!!errors.stage}
                    helperText={errors.stage?.message}
                  >
                    {stages.map((stage) => (
                      <MenuItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="expectedCloseDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Expected Close Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.expectedCloseDate}
                    helperText={errors.expectedCloseDate?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company"
                  />
                )}
              />
            </Grid>
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

export default DealForm;