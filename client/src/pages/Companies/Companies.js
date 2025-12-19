import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '../../components/Companies/CompanyForm';
import MobileTable from '../../components/Mobile/MobileTable';
import MobileFAB from '../../components/Mobile/MobileFAB';

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Mock data for now
  useEffect(() => {
    const mockCompanies = [
      {
        _id: '1',
        name: 'TechCorp Solutions',
        domain: 'techcorp.com',
        industry: 'SaaS',
        size: '201-500',
        status: 'customer',
        healthScore: 85,
        healthStatus: 'healthy',
        arr: 120000,
        accountExecutive: { firstName: 'John', lastName: 'Smith' },
        customerSuccessManager: { firstName: 'Sarah', lastName: 'Johnson' },
        contactCount: 8,
        dealCount: 3,
        lastEngagement: new Date('2024-12-15'),
      },
      {
        _id: '2',
        name: 'StartupXYZ',
        domain: 'startupxyz.io',
        industry: 'Fintech',
        size: '11-50',
        status: 'prospect',
        healthScore: 65,
        healthStatus: 'at-risk',
        arr: 0,
        accountExecutive: { firstName: 'Mike', lastName: 'Davis' },
        contactCount: 3,
        dealCount: 1,
        lastEngagement: new Date('2024-12-10'),
      },
    ];
    
    setTimeout(() => {
      setCompanies(mockCompanies);
      setLoading(false);
    }, 1000);
  }, []);

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'at-risk': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'customer': return 'success';
      case 'prospect': return 'primary';
      case 'churned': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setOpenDialog(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setOpenDialog(true);
  };

  const handleViewCompany = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading companies...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Companies
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCompany}
          sx={{ borderRadius: 2, display: { xs: 'none', md: 'flex' } }}
        >
          Add Company
        </Button>
      </Box>

      {/* Mobile FAB */}
      <MobileFAB onClick={handleAddCompany} />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <BusinessIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                    {companies.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Companies
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                    {companies.filter(c => c.status === 'customer').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Active Customers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                    {companies.filter(c => c.status === 'prospect').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Prospects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <MoneyIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                    {formatCurrency(companies.reduce((sum, c) => sum + (c.arr || 0), 0))}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total ARR
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search companies by name, domain, or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </CardContent>
      </Card>

      {/* Mobile View */}
      <MobileTable
        data={filteredCompanies}
        onView={handleViewCompany}
        onEdit={handleEditCompany}
        getStatusColor={getStatusColor}
        getHealthColor={getHealthColor}
        formatCurrency={formatCurrency}
        type="companies"
      />

      {/* Desktop Table */}
      <Card sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Health</TableCell>
                <TableCell>ARR</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {company.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {company.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.domain}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={company.industry} size="small" />
                  </TableCell>
                  <TableCell>{company.size}</TableCell>
                  <TableCell>
                    <Chip 
                      label={company.status} 
                      color={getStatusColor(company.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={company.healthStatus} 
                        color={getHealthColor(company.healthStatus)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {company.healthScore}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(company.arr || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {company.accountExecutive ? 
                        `${company.accountExecutive.firstName} ${company.accountExecutive.lastName}` : 
                        'Unassigned'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {company.lastEngagement ? 
                        company.lastEngagement.toLocaleDateString() : 
                        'Never'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewCompany(company._id)}
                        sx={{ mr: 1 }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Company">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditCompany(company)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Company Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <CompanyForm 
            company={selectedCompany}
            onSubmit={(data) => {
              // Handle form submission
              console.log('Company data:', data);
              setOpenDialog(false);
            }}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Companies;