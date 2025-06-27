import React from 'react';
import { Container, Box } from '@mui/material';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Navigation />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default Layout;
