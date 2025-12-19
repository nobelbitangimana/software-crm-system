import React, { useEffect } from 'react';
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
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { createCampaign, updateCampaign } from '../../store/slices/campaignsSlice';

const schema = yup.object({
  name: yup.string().required('Campaign name is required'),
  description: yup.string(),
  type: yup.string().required('Campaign type is required'),
  status: yup.string(),
  startDate: yup.date(),
  endDate: yup.date(),
});

const campaignTypes = [
  { value: 'email', label: 'Email Campaign' },
  { value: 'social', label: 'Social Media' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'drip_sequence', label: 'Drip Sequence' },
  { value: 'nurture', label: 'Nurture Campaign' },
];

const campaignStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

const CampaignForm = ({ open, onClose, campaign }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(campaign);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      type: 'email',
      status: 'draft',
      startDate: '',
      endDate: '',
      tags: [],
      content: {
        subject: '',
        htmlContent: '',
        textContent: '',
        template: '',
      },
      settings: {
        sendTime: '09:00',
        timezone: 'America/New_York',
        frequency: 'once',
        abTestEnabled: false,
      },
      targetAudience: {
        segments: [],
        tags: [],
        customFilters: {},
      },
    },
  });

  useEffect(() => {
    if (campaign) {
      reset({
        ...campaign,
        startDate: campaign.startDate ? 
          new Date(campaign.startDate).toISOString().split('T')[0] : '',
        endDate: campaign.endDate ? 
          new Date(campaign.endDate).toISOString().split('T')[0] : '',
        tags: campaign.tags || [],
        content: campaign.content || {
          subject: '',
          htmlContent: '',
          textContent: '',
          template: '',
        },
        settings: campaign.settings || {
          sendTime: '09:00',
          timezone: 'America/New_York',
          frequency: 'once',
          abTestEnabled: false,
        },
        targetAudience: campaign.targetAudience || {
          segments: [],
          tags: [],
          customFilters: {},
        },
      });
    } else {
      reset({
        name: '',
        description: '',
        type: 'email',
        status: 'draft',
        startDate: '',
        endDate: '',
        tags: [],
        content: {
          subject: '',
          htmlContent: '',
          textContent: '',
          template: '',
        },
        settings: {
          sendTime: '09:00',
          timezone: 'America/New_York',
          frequency: 'once',
          abTestEnabled: false,
        },
        targetAudience: {
          segments: [],
          tags: [],
          customFilters: {},
        },
      });
    }
  }, [campaign, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await dispatch(updateCampaign({ id: campaign._id, data })).unwrap();
        toast.success('Campaign updated successfully');
      } else {
        await dispatch(createCampaign(data)).unwrap();
        toast.success('Campaign created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Campaign' : 'Create New Campaign'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Campaign Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
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
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Campaign Type"
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    {campaignTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
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
                    {campaignStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            {/* Tags */}
            <Grid item xs={12}>
              <Controller
                name="tags"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControl fullWidth>
                    <InputLabel>Tags</InputLabel>
                    <Select
                      multiple
                      value={value || []}
                      onChange={onChange}
                      input={<OutlinedInput label="Tags" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((tag) => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {['Product Launch', 'Email', 'Social Media', 'Retention', 'Customer Care', 'Promotion'].map((tag) => (
                        <MenuItem key={tag} value={tag}>
                          {tag}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Content Section */}
            <Grid item xs={12}>
              <Controller
                name="content.subject"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Subject"
                    placeholder="Enter email subject line"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="content.textContent"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Email Content"
                    placeholder="Enter your campaign message..."
                  />
                )}
              />
            </Grid>
            
            {/* Settings */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="settings.sendTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="time"
                    label="Send Time"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="settings.timezone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Timezone"
                  >
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                  </TextField>
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

export default CampaignForm;