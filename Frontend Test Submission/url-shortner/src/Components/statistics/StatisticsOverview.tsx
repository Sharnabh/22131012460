import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip
} from '@mui/material';
import {
  Link as LinkIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Mouse as MouseIcon
} from '@mui/icons-material';
import { UrlStatistics } from '../../types';
import { logComponentEvent } from '../../utils/logging';

interface StatisticsOverviewProps {
  statistics: UrlStatistics;
}

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ statistics }) => {
  React.useEffect(() => {
    logComponentEvent("StatisticsOverview", "rendered", `${statistics.totalUrls} URLs, ${statistics.totalClicks} clicks`);
  }, [statistics]);

  const statCards = [
    {
      title: 'Total URLs',
      value: statistics.totalUrls,
      icon: <LinkIcon />,
      color: 'primary.main',
      backgroundColor: 'primary.50'
    },
    {
      title: 'Active URLs',
      value: statistics.activeUrls,
      icon: <ScheduleIcon />,
      color: 'success.main',
      backgroundColor: 'success.50'
    },
    {
      title: 'Total Clicks',
      value: statistics.totalClicks,
      icon: <MouseIcon />,
      color: 'info.main',
      backgroundColor: 'info.50'
    },
    {
      title: 'Avg. Clicks/URL',
      value: statistics.averageClicksPerUrl.toFixed(1),
      icon: <TrendingUpIcon />,
      color: 'warning.main',
      backgroundColor: 'warning.50'
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Overview
      </Typography>      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          },
          gap: 3
        }}
      >
        {statCards.map((stat, index) => (
          <Card elevation={1} key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    backgroundColor: stat.backgroundColor,
                    color: stat.color,
                    borderRadius: '50%',
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Most Clicked URL */}
      {statistics.mostClickedUrl && (
        <Card elevation={1} sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Most Popular URL
              </Typography>
              <Chip 
                label={`${statistics.mostClickedUrl.clickCount} clicks`}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Short URL:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'monospace',
                backgroundColor: 'grey.100',
                padding: '4px 8px',
                borderRadius: 1,
                mb: 1
              }}
            >
              {statistics.mostClickedUrl.shortUrl}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Original URL:
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                wordBreak: 'break-all',
                color: 'primary.main'
              }}
            >
              {statistics.mostClickedUrl.originalUrl}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StatisticsOverview;
