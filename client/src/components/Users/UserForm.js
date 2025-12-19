import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const UserForm = ({ user, onSubmit, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'sdr',
    department: '',
    territory: '',
    phone: '',
    quota: '',
    commissionRate: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isEdit) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '', // Don't populate password for edit
        role: user.role || 'sdr',
        department: user.department || '',
        territory: user.territory || '',
        phone: user.phone || '',
        quota: user.quota || '',
        commissionRate: user.commissionRate || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    }
  }, [user, isEdit]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isEdit && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      
      // Don't send empty password for edit
      if (isEdit && !submitData.password) {
        delete submitData.password;
      }
      
      // Convert numeric fields or remove empty ones
      if (submitData.quota && submitData.quota !== '') {
        submitData.quota = parseFloat(submitData.quota);
      } else {
        delete submitData.quota;
      }
      
      if (submitData.commissionRate && submitData.commissionRate !== '') {
        submitData.commissionRate = parseFloat(submitData.commissionRate);
      } else {
        delete submitData.commissionRate;
      }
      
      // Remove empty string fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          delete submitData[key];
        }
      });
      
      onSubmit(submitData);
    }
  };

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full system access' },
    { value: 'sdr', label: 'SDR (Sales Development Rep)', description: 'Lead generation and qualification' },
    { value: 'ae', label: 'AE (Account Executive)', description: 'Deal management and closing' },
    { value: 'csm', label: 'CSM (Customer Success Manager)', description: 'Post-sale relationship management' },
    { value: 'account_manager', label: 'Account Manager', description: 'Upsell and cross-sell' },
    { value: 'support_engineer', label: 'Support Engineer', description: 'Customer support' },
    { value: 'product', label: 'Product/Engineering', description: 'Limited customer insight access' },
    { value: 'marketing', label: 'Marketing', description: 'Campaign and lead management' },
    { value: 'executive', label: 'Executive', description: 'High-level overview' },
  ];

  const departments = [
    'Sales',
    'Marketing',
    'Customer Success',
    'Support',
    'Product',
    'Engineering',
    'Finance',
    'HR',
    'Operations',
    'Executive'
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Basic Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            required={!isEdit}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
            }
            label="Active User"
          />
        </Grid>

        {/* Role & Permissions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Role & Permissions
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.role}>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => handleChange('role', e.target.value)}
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  <Box>
                    <Typography variant="body1">{role.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.role}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info">
            Permissions are automatically assigned based on the selected role. 
            Each role has predefined access levels to different parts of the system.
          </Alert>
        </Grid>

        {/* Work Details */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Work Details
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={(e) => handleChange('department', e.target.value)}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Territory"
            value={formData.territory}
            onChange={(e) => handleChange('territory', e.target.value)}
            placeholder="e.g., North America, EMEA, APAC"
          />
        </Grid>

        {/* Sales-specific fields */}
        {(formData.role === 'sdr' || formData.role === 'ae' || formData.role === 'account_manager') && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Quota ($)"
                type="number"
                value={formData.quota}
                onChange={(e) => handleChange('quota', e.target.value)}
                placeholder="e.g., 50000"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Commission Rate (%)"
                type="number"
                value={formData.commissionRate}
                onChange={(e) => handleChange('commissionRate', e.target.value)}
                placeholder="e.g., 5.5"
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
            </Grid>
          </>
        )}

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserForm;