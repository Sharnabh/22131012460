import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { BarChart } from '@mui/icons-material';
import StatisticsOverview from '../Components/statistics/StatisticsOverview';
import UrlList from '../Components/statistics/UrlList';
import { urlShortenerService } from '../services/urlShortenerService';
import { ShortenedUrl, UrlStatistics } from '../types';

const StatisticsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [statistics, setStatistics] = useState<UrlStatistics>({
    totalUrls: 0,
    activeUrls: 0,
    expiredUrls: 0,
    totalClicks: 0,
    averageClicksPerUrl: 0
  });

  useEffect(() => {
    // Load URLs and statistics
    const loadData = () => {
      const allUrls = urlShortenerService.getShortenedUrls();
      const stats = urlShortenerService.getStatistics();
      setUrls(allUrls);
      setStatistics(stats);
    };

    loadData();
    
    // Refresh data every 30 seconds to catch any new clicks
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, backgroundColor: 'secondary.main', color: 'white', borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          <BarChart sx={{ fontSize: '2rem', mr: 1, verticalAlign: 'middle' }} />
          URL Statistics
        </Typography>        <Typography variant="h6" align="center" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto', mb: 1 }}>
          View detailed analytics and performance metrics for your shortened URLs
        </Typography>
        <Typography variant="body2" align="center" sx={{ opacity: 0.7, maxWidth: 800, mx: 'auto' }}>
          Click locations are determined using IP geolocation and browser location services (with user permission)
        </Typography>
      </Paper>

      {/* Statistics Overview */}
      <StatisticsOverview statistics={statistics} />
      
      <Divider sx={{ my: 4 }} />
      
      {/* Detailed URL List */}
      <UrlList urls={urls} />
    </Box>
  );
};

export default StatisticsPage;
