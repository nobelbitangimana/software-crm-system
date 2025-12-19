import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Business as BusinessIcon,
  Extension as IntegrationIcon,
  Backup as BackupIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  People as UsersIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  VpnKey as ResetPasswordIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import UserForm from '../../components/Users/UserForm';
import axios from 'axios';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  
  // User management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    weeklyReports: true,
    dealUpdates: true,
    taskReminders: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileSave = () => {
    // In a real app, this would make an API call
    toast.success('Profile updated successfully');
  };

  const handleNotificationSave = () => {
    // In a real app, this would make an API call
    toast.success('Notification preferences updated');
  };

  const handleSecuritySave = () => {
    // In a real app, this would make an API call
    toast.success('Security settings updated');
  };

  const handleExportData = () => {
    toast.info('Data export started. You will receive an email when ready.');
  };

  const handleBackupData = () => {
    toast.info('Backup initiated successfully');
  };

  // Token refresh helper
  const refreshTokenIfNeeded = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      return null;
    }

    try {
      // Check if token is expired
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const now = Date.now() / 1000;
        
        // If token expires in less than 5 minutes, refresh it
        if (payload.exp - now < 300) {
          console.log('Token expiring soon, refreshing...');
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
              refreshToken
            });
            const newToken = response.data.accessToken;
            localStorage.setItem('accessToken', newToken);
            toast.success('Authentication refreshed');
            return newToken;
          }
        }
      }
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      toast.error('Authentication expired. Please log in again.');
      return null;
    }
  };

  // User management functions
  const fetchUsers = async () => {
    if (user?.role !== 'admin') {
      console.log('User is not admin, skipping user fetch');
      return;
    }
    
    setLoadingUsers(true);
    try {
      const token = await refreshTokenIfNeeded();
      if (!token) {
        setLoadingUsers(false);
        return;
      }
      
      console.log('Fetching users with token:', token ? 'Token exists' : 'No token');
      console.log('API URL:', process.env.REACT_APP_API_URL);
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Users response:', response.data);
      setUsers(response.data.users || []);
      toast.success(`Loaded ${response.data.users?.length || 0} users`);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        toast.error(`Failed to fetch users: ${error.response.data.message || error.response.status}`);
      } else {
        toast.error(`Failed to fetch users: ${error.message}`);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setUserDialogOpen(true);
  };

  const handleEditUser = (userToEdit) => {
    setSelectedUser(userToEdit);
    setIsEditMode(true);
    setUserDialogOpen(true);
  };

  const handleUserSubmit = async (userData) => {
    try {
      const token = await refreshTokenIfNeeded();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Submitting user data:', userData);
      console.log('Using token:', token.substring(0, 20) + '...');

      if (isEditMode && selectedUser) {
        // Update user
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/${selectedUser._id}`, userData, config);
        console.log('Update response:', response.data);
        toast.success('User updated successfully');
      } else {
        // Create user
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/users`, userData, config);
        console.log('Create response:', response.data);
        toast.success('User created successfully');
      }

      setUserDialogOpen(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error saving user:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else if (error.response?.status === 403) {
        toast.error('Insufficient permissions to perform this action.');
      } else {
        const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to save user';
        toast.error(message);
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        const token = await refreshTokenIfNeeded();
        if (!token) {
          toast.error('Authentication required. Please log in again.');
          return;
        }

        await axios.delete(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the list
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } else {
          const message = error.response?.data?.message || 'Failed to delete user';
          toast.error(message);
        }
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const newPassword = prompt(`Enter new password for ${userName}:`);
    if (newPassword && newPassword.length >= 6) {
      try {
        const token = await refreshTokenIfNeeded();
        if (!token) {
          toast.error('Authentication required. Please log in again.');
          return;
        }

        await axios.post(`${process.env.REACT_APP_API_URL}/users/${userId}/reset-password`, 
          { newPassword }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Password reset successfully');
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } else {
          const message = error.response?.data?.message || 'Failed to reset password';
          toast.error(message);
        }
        console.error('Error resetting password:', error);
      }
    } else if (newPassword !== null) {
      toast.error('Password must be at least 6 characters long');
    }
  };

  // Fetch users when component mounts and user is admin
  React.useEffect(() => {
    if (user?.role === 'admin' && activeTab === 1) {
      fetchUsers();
    }
  }, [user, activeTab]); // fetchUsers is stable, no need to include

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          {user?.role === 'admin' && <Tab icon={<UsersIcon />} label="User Management" />}
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<BusinessIcon />} label="Company" />
          <Tab icon={<IntegrationIcon />} label="Integrations" />
          <Tab icon={<BackupIcon />} label="Data & Backup" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                  >
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </Avatar>
                  <Typography variant="h6">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button fullWidth startIcon={<EditIcon />}>
                    Change Photo
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleProfileSave}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* User Management Tab (Admin only) */}
        {user?.role === 'admin' && (
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                User Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </Box>

            {loadingUsers ? (
              <Typography>Loading users...</Typography>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {users.map((userItem) => (
                    <Grid item xs={12} md={6} lg={4} key={userItem._id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6">
                                {userItem.firstName} {userItem.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {userItem.email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {userItem.role?.charAt(0).toUpperCase() + userItem.role?.slice(1)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography 
                                variant="body2" 
                                color={userItem.isActive ? 'success.main' : 'error.main'}
                              >
                                {userItem.isActive ? 'Active' : 'Inactive'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditUser(userItem)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<ResetPasswordIcon />}
                              onClick={() => handleResetPassword(userItem._id, `${userItem.firstName} ${userItem.lastName}`)}
                            >
                              Reset Password
                            </Button>
                            {userItem._id !== user._id && (
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteUser(userItem._id, `${userItem.firstName} ${userItem.lastName}`)}
                              >
                                Delete
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {users.length === 0 && !loadingUsers && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click "Add User" to create your first team member
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </TabPanel>
        )}

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={user?.role === 'admin' ? 2 : 1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  General Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked
                      })}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: e.target.checked
                      })}
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: e.target.checked
                      })}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  CRM Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.dealUpdates}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        dealUpdates: e.target.checked
                      })}
                    />
                  }
                  label="Deal Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.taskReminders}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        taskReminders: e.target.checked
                      })}
                    />
                  }
                  label="Task Reminders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        weeklyReports: e.target.checked
                      })}
                    />
                  }
                  label="Weekly Reports"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        marketingEmails: e.target.checked
                      })}
                    />
                  }
                  label="Marketing Emails"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleNotificationSave}
              >
                Save Preferences
              </Button>
            </Box>
          </Paper>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={user?.role === 'admin' ? 3 : 2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        twoFactorEnabled: e.target.checked
                      })}
                    />
                  }
                  label="Two-Factor Authentication"
                />

                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: parseInt(e.target.value)
                  })}
                  sx={{ mt: 2 }}
                />

                <TextField
                  fullWidth
                  label="Password Expiry (days)"
                  type="number"
                  value={securitySettings.passwordExpiry}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    passwordExpiry: parseInt(e.target.value)
                  })}
                  sx={{ mt: 2 }}
                />

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSecuritySave}
                  >
                    Save Settings
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Password Management
                </Typography>
                
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  sx={{ mb: 2 }}
                />

                <Button variant="outlined" fullWidth>
                  Change Password
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Company Tab */}
        <TabPanel value={activeTab} index={user?.role === 'admin' ? 4 : 3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Company Information
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Company settings are managed by administrators only.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value="Demo CRM Company"
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  value="Technology"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Address"
                  multiline
                  rows={3}
                  value="123 Business St, Suite 100, City, State 12345"
                  disabled
                />
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Integrations Tab */}
        <TabPanel value={activeTab} index={user?.role === 'admin' ? 5 : 4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Third-Party Integrations
            </Typography>
            
            <Grid container spacing={3}>
              {[
                { name: 'Google Workspace', status: 'Connected', color: 'success' },
                { name: 'Microsoft 365', status: 'Not Connected', color: 'default' },
                { name: 'Slack', status: 'Connected', color: 'success' },
                { name: 'Zoom', status: 'Not Connected', color: 'default' },
                { name: 'Mailchimp', status: 'Connected', color: 'success' },
                { name: 'Salesforce', status: 'Not Connected', color: 'default' },
              ].map((integration, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{integration.name}</Typography>
                      <Typography 
                        variant="body2" 
                        color={integration.color === 'success' ? 'success.main' : 'text.secondary'}
                      >
                        {integration.status}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">
                        {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </TabPanel>

        {/* Data & Backup Tab */}
        <TabPanel value={activeTab} index={user?.role === 'admin' ? 6 : 5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Data Export
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Export your CRM data in various formats for backup or migration purposes.
                </Typography>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={handleExportData}
                >
                  Export All Data (CSV)
                </Button>
                <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                  Export Contacts Only
                </Button>
                <Button variant="outlined" fullWidth>
                  Export Deals Only
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  System Backup
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create and manage system backups to ensure data safety.
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={handleBackupData}
                >
                  Create Backup Now
                </Button>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Backup History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last backup: Today, 2:30 PM<br />
                  Previous backup: Yesterday, 2:30 PM<br />
                  Status: All backups successful
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Version: 1.0.0
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Database: Demo Mode
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Storage Used: 2.3 GB
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Active Users: 2
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* User Dialog */}
      <Dialog 
        open={userDialogOpen} 
        onClose={() => setUserDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <UserForm 
            user={selectedUser}
            onSubmit={handleUserSubmit}
            onCancel={() => setUserDialogOpen(false)}
            isEdit={isEditMode}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Settings;