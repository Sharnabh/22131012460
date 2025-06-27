import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import { BarChart } from '@mui/icons-material';

const StatisticsPage: React.FC = () => {
  return (
    <Box>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, backgroundColor: 'secondary.main', color: 'white', borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          <BarChart sx={{ fontSize: '2rem', mr: 1, verticalAlign: 'middle' }} />
          URL Statistics
        </Typography>
        <Typography variant="h6" align="center" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          View detailed analytics and statistics for your shortened URLs
        </Typography>
      </Paper>

      <Alert severity="info" sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Coming Soon! 🚀
        </Typography>
        <Typography variant="body1">
          The statistics page will be implemented in the next phase of development.
          It will include detailed analytics, click tracking, and usage patterns for your shortened URLs.
        </Typography>
      </Alert>
    </Box>
  );
};

export default StatisticsPage;
