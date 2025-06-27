import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import UrlForm from '../Components/urlShortner/UrlForm';
import UrlResults from '../Components/urlShortner/UrlResults';
import { urlShortenerService } from '../services/urlShortenerService';
import { ShortenedUrl, UrlFormData } from '../types';
import { MAX_URLS } from '../utils/constants';

const UrlShortenerPage: React.FC = () => {
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  // Clean up expired URLs on component mount and periodically
  useEffect(() => {
    const refreshUrls = () => {
      urlShortenerService.clearExpiredUrls();
      setShortenedUrls(urlShortenerService.getShortenedUrls());
    };

    refreshUrls();
    const interval = setInterval(refreshUrls, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleCreateShortUrl = async (formData: UrlFormData): Promise<ShortenedUrl> => {
    if (shortenedUrls.length >= MAX_URLS) {
      throw new Error(`Maximum of ${MAX_URLS} URLs allowed`);
    }

    try {
      const newUrl = await urlShortenerService.createShortUrl(formData);
      // Refresh the URLs from the service (single source of truth)
      setShortenedUrls(urlShortenerService.getShortenedUrls());
      setError('');
      setSuccess('Short URL created successfully! 🎉');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      return newUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  const handleDeleteUrl = (id: string) => {
    // Remove from service and refresh state
    urlShortenerService.deleteUrl(id);
    setShortenedUrls(urlShortenerService.getShortenedUrls());
    setSuccess('URL deleted successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <Box>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, backgroundColor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          URL Shortener
        </Typography>
        <Typography variant="h6" align="center" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          Transform your long URLs into short, manageable links. 
          Create up to {MAX_URLS} URLs with custom expiry times and personalized short codes.
        </Typography>
      </Paper>

      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* URL Creation Form */}
        <UrlForm 
          onSubmit={handleCreateShortUrl}
          disabled={shortenedUrls.length >= MAX_URLS}
          urlCount={shortenedUrls.length}
        />
        
        {/* Results Display */}
        <UrlResults 
          urls={shortenedUrls} 
          onDelete={handleDeleteUrl}
        />
      </Box>

      {/* Usage Tips */}
      {shortenedUrls.length === 0 && (
        <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
          <Typography variant="h6" gutterBottom color="info.main">
            💡 Quick Tips:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Leave validity period empty to use the default 30 minutes
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Custom short codes must be 3-10 alphanumeric characters
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              URLs automatically expire after their validity period
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Click the copy button to quickly share your short URLs
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default UrlShortenerPage;
