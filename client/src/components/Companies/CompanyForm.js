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
  Chip,
  Autocomplete,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const CompanyForm = ({ company, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '',
    website: '',
    description: '',
    annualRevenue: '',
    fundingStage: '',
    status: 'prospect',
    techStack: [],
    integrationNeeds: [],
    securityRequirements: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    linkedinUrl: '',
    twitterHandle: '',
    source: '',
  });

  const [techStackInput, setTechStackInput] = useState('');
  const [integrationInput, setIntegrationInput] = useState('');
  const [securityInput, setSecurityInput] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        ...company,
        annualRevenue: company.annualRevenue || '',
        address: company.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        techStack: company.techStack || [],
        integrationNeeds: company.integrationNeeds || [],
        securityRequirements: company.securityRequirements || [],
      });
    }
  }, [company]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddChip = (field, value, setValue) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const handleRemoveChip = (field, chipToRemove) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(chip => chip !== chipToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const industries = [
    'SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education', 
    'Enterprise', 'Startup', 'Other'
  ];

  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  const fundingStages = [
    'Bootstrap', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'IPO'
  ];

  const sources = [
    'website', 'referral', 'cold_outreach', 'inbound', 'partner', 
    'event', 'social_media', 'other'
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
            label="Company Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Domain"
            value={formData.domain}
            onChange={(e) => handleChange('domain', e.target.value)}
            placeholder="example.com"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select
              value={formData.industry}
              label="Industry"
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              {industries.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Company Size</InputLabel>
            <Select
              value={formData.size}
              label="Company Size"
              onChange={(e) => handleChange('size', e.target.value)}
            >
              {companySizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size} employees
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Website"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://example.com"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Annual Revenue"
            type="number"
            value={formData.annualRevenue}
            onChange={(e) => handleChange('annualRevenue', e.target.value)}
            InputProps={{
              startAdornment: '$',
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </Grid>

        {/* Business Details */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Business Details
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Funding Stage</InputLabel>
            <Select
              value={formData.fundingStage}
              label="Funding Stage"
              onChange={(e) => handleChange('fundingStage', e.target.value)}
            >
              {fundingStages.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <MenuItem value="prospect">Prospect</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="churned">Churned</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Lead Source</InputLabel>
            <Select
              value={formData.source}
              label="Lead Source"
              onChange={(e) => handleChange('source', e.target.value)}
            >
              {sources.map((source) => (
                <MenuItem key={source} value={source}>
                  {source.replace('_', ' ').toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Technical Information */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Technical Information
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tech Stack"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddChip('techStack', techStackInput, setTechStackInput);
              }
            }}
            placeholder="Type and press Enter to add technologies"
            helperText="Press Enter to add each technology"
          />
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.techStack.map((tech, index) => (
              <Chip
                key={index}
                label={tech}
                onDelete={() => handleRemoveChip('techStack', tech)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Integration Needs"
            value={integrationInput}
            onChange={(e) => setIntegrationInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddChip('integrationNeeds', integrationInput, setIntegrationInput);
              }
            }}
            placeholder="Type and press Enter to add integrations"
            helperText="Press Enter to add each integration need"
          />
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.integrationNeeds.map((integration, index) => (
              <Chip
                key={index}
                label={integration}
                onDelete={() => handleRemoveChip('integrationNeeds', integration)}
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>

        {/* Address */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Address
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={formData.address.street}
            onChange={(e) => handleChange('address.street', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City"
            value={formData.address.city}
            onChange={(e) => handleChange('address.city', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="State/Province"
            value={formData.address.state}
            onChange={(e) => handleChange('address.state', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="ZIP/Postal Code"
            value={formData.address.zipCode}
            onChange={(e) => handleChange('address.zipCode', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Country"
            value={formData.address.country}
            onChange={(e) => handleChange('address.country', e.target.value)}
          />
        </Grid>

        {/* Social */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Social Media
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="LinkedIn URL"
            value={formData.linkedinUrl}
            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/company/example"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Twitter Handle"
            value={formData.twitterHandle}
            onChange={(e) => handleChange('twitterHandle', e.target.value)}
            placeholder="@example"
          />
        </Grid>

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
              {company ? 'Update Company' : 'Create Company'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyForm;