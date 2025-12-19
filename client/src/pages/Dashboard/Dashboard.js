import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Support,
  AttachMoney,
  Domain as CompanyIcon,
  Subscriptions as SubscriptionsIcon,
  Assessment as AnalyticsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Mock data
const salesData = [
  { month: 'Jan', revenue: 45000, deals: 12 },
  { month: 'Feb', revenue: 52000, deals: 15 },
  { month: 'Mar', revenue: 48000, deals: 13 },
  { month: 'Apr', revenue: 61000, deals: 18 },
  { month: 'May', revenue: 55000, deals: 16 },
  { month: 'Jun', revenue: 67000, deals: 20 },
];

const leadSourceData = [
  { name: 'Website', value: 35, color: '#0088FE' },
  { name: 'Referral', value: 25, color: '#00C49F' },
  { name: 'Social Media', value: 20, color: '#FFBB28' },
  { name: 'Email Campaign', value: 15, color: '#FF8042' },
  { name: 'Other', value: 5, color: '#8884D8' },
];

const recentActivities = [
  {
    id: 1,
    type: 'deal',
    title: 'Deal "ABC Corp" moved to Negotiation',
    time: '2 hours ago',
    avatar: 'D',
  },
  {
    id: 2,
    type: 'contact',
    title: 'New contact "John Smith" added',
    time: '4 hours ago',
    avatar: 'C',
  },
  {
    id: 3,
    type: 'ticket',
    title: 'Support ticket #12345 resolved',
    time: '6 hours ago',
    avatar: 'T',
  },
  {
    id: 4,
    type: 'campaign',
    title: 'Email campaign "Summer Sale" sent',
    time: '1 day ago',
    avatar: 'E',
  },
];

const StatCard = ({ title, value, icon, color, change }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: 'success.main' }}>
                {change}% from last month
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value="$328K"
            icon={<AttachMoney />}
            color="primary.main"
            change={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Deals"
            value="47"
            icon={<Business />}
            color="success.main"
            change={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Contacts"
            value="156"
            icon={<People />}
            color="info.main"
            change={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Tickets"
            value="23"
            icon={<Support />}
            color="warning.main"
            change={-5}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Sales Performance
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Lead Sources */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Lead Sources
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {activity.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={activity.time}
                  />
                  <Chip
                    label={activity.type}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Deal Pipeline */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Deal Pipeline
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={[
                  { stage: 'Lead', count: 25, value: 125000 },
                  { stage: 'Qualified', count: 18, value: 180000 },
                  { stage: 'Proposal', count: 12, value: 240000 },
                  { stage: 'Negotiation', count: 8, value: 320000 },
                  { stage: 'Closed Won', count: 5, value: 250000 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;