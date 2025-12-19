import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data
const salesTrendData = [
  { month: 'Jan', revenue: 45000, deals: 12 },
  { month: 'Feb', revenue: 52000, deals: 15 },
  { month: 'Mar', revenue: 48000, deals: 13 },
  { month: 'Apr', revenue: 61000, deals: 18 },
  { month: 'May', revenue: 55000, deals: 16 },
  { month: 'Jun', revenue: 67000, deals: 20 },
];

const pipelineData = [
  { stage: 'Lead', count: 25, value: 125000 },
  { stage: 'Qualified', count: 18, value: 180000 },
  { stage: 'Proposal', count: 12, value: 240000 },
  { stage: 'Negotiation', count: 8, value: 320000 },
  { stage: 'Closed Won', count: 5, value: 250000 },
];

const leadSourceData = [
  { name: 'Website', value: 35, color: '#0088FE' },
  { name: 'Referral', value: 25, color: '#00C49F' },
  { name: 'Social Media', value: 20, color: '#FFBB28' },
  { name: 'Email Campaign', value: 15, color: '#FF8042' },
  { name: 'Other', value: 5, color: '#8884D8' },
];

const Analytics = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics & Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Sales Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend (6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={salesTrendData}>
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

        {/* Pipeline Analysis */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Sales Pipeline Analysis
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1976d2" name="Deal Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Additional Analytics Sections */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Performance
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Email open rates, click-through rates, conversion tracking, 
              and ROI analysis for marketing campaigns.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>
              Support Metrics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ticket resolution times, customer satisfaction scores, 
              SLA compliance, and support team performance.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;