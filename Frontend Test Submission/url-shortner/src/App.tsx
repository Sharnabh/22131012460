import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, CircularProgress } from '@mui/material';
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import Layout from './Components/Common/Layout';
import UrlShortenerPage from './pages/UrlShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import { urlShortenerService } from './services/urlShortenerService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Component to handle short URL redirects
const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [redirecting, setRedirecting] = React.useState(true);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setRedirecting(false);
      return;
    }

    const originalUrl = urlShortenerService.getOriginalUrl(shortCode);
    if (originalUrl) {
      // Add a small delay to show the redirecting message
      setTimeout(() => {
        window.location.href = originalUrl;
      }, 1000);
    } else {
      setError('URL not found or expired');
      setRedirecting(false);
      // Redirect to main page after showing error
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, [shortCode]);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        gap: 2
      }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Redirecting to home page...
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      gap: 2
    }}>
      <Typography variant="h5">
        Redirecting to your URL...
      </Typography>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        You will be redirected shortly
      </Typography>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<UrlShortenerPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route 
              path="/:shortCode" 
              element={<RedirectHandler />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
