import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link, BarChart } from '@mui/icons-material';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          🔗 URL Shortener
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            startIcon={<Link />}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ 
              color: 'white',
              borderColor: location.pathname === '/' ? 'white' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Shortener
          </Button>
          
          <Button
            component={RouterLink}
            to="/statistics"
            color="inherit"
            startIcon={<BarChart />}
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
            sx={{ 
              color: 'white',
              borderColor: location.pathname === '/statistics' ? 'white' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
