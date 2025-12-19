import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

const MobileTable = ({ 
  data, 
  onView, 
  onEdit, 
  getStatusColor, 
  getHealthColor, 
  formatCurrency,
  type = 'companies' 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  const renderCompanyCard = (item) => (
    <Card key={item._id} sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 48, height: 48 }}>
            {item.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {item.domain}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip label={item.industry} size="small" />
              <Chip label={item.size} size="small" variant="outlined" />
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton size="small" onClick={() => onView(item._id)}>
              <ViewIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(item)}>
              <EditIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={item.status} 
              color={getStatusColor(item.status)}
              size="small"
            />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Health
            </Typography>
            <Chip 
              label={`${item.healthScore}%`} 
              color={getHealthColor(item.healthStatus)}
              size="small"
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              ARR
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {formatCurrency(item.arr || 0)}
            </Typography>
          </Box>
        </Box>
        
        {item.accountExecutive && (
          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Account Executive: {item.accountExecutive.firstName} {item.accountExecutive.lastName}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderContactCard = (item) => (
    <Card key={item._id} sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main', width: 48, height: 48 }}>
            {item.firstName.charAt(0)}{item.lastName.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {item.firstName} {item.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {item.jobTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {item.company?.name || item.company}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton size="small" href={`tel:${item.phone}`}>
              <PhoneIcon />
            </IconButton>
            <IconButton size="small" href={`mailto:${item.email}`}>
              <EmailIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={item.status} 
              color={getStatusColor(item.status)}
              size="small"
            />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Department
            </Typography>
            <Typography variant="body2">
              {item.department || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Lead Score
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {item.leadScore || 0}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDealCard = (item) => (
    <Card key={item._id} sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'success.main', width: 48, height: 48 }}>
            $
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {item.company?.name || item.company}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip label={item.stage} size="small" />
              <Chip label={`${item.probability}%`} size="small" variant="outlined" />
            </Stack>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
              {formatCurrency(item.value)}
            </Typography>
            {item.arr && (
              <Typography variant="body2" color="text.secondary">
                ARR: {formatCurrency(item.arr)}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Deal Type
            </Typography>
            <Typography variant="body2">
              {item.dealType || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Contract
            </Typography>
            <Typography variant="body2">
              {item.contractType || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Seats
            </Typography>
            <Typography variant="body2">
              {item.seats || 'N/A'}
            </Typography>
          </Box>
        </Box>
        
        {item.trialStatus && (
          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Trial Status: <Chip label={item.trialStatus} size="small" />
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderCard = (item) => {
    switch (type) {
      case 'companies':
        return renderCompanyCard(item);
      case 'contacts':
        return renderContactCard(item);
      case 'deals':
        return renderDealCard(item);
      default:
        return renderCompanyCard(item);
    }
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      {data.map(renderCard)}
    </Box>
  );
};

export default MobileTable;