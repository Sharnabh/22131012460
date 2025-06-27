import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Link,
  Divider,
  Alert,
  Snackbar,
  Tooltip,
  Button
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { ShortenedUrl } from '../../types';
import { formatExpiryDate, isExpired } from '../../utils/validation';

interface UrlResultsProps {
  urls: ShortenedUrl[];
  onDelete?: (id: string) => void;
}

const UrlResults: React.FC<UrlResultsProps> = ({ urls, onDelete }) => {
  const [copiedUrl, setCopiedUrl] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleCopy = async (text: string, type: 'short' | 'original') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(`${type}-${text}`);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleRedirect = (originalUrl: string) => {
    window.open(originalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShortUrlClick = (shortCode: string) => {
    // Navigate to the short URL route within the same app
    navigate(`/${shortCode}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setCopiedUrl('');
  };

  const activeUrls = urls.filter(url => !isExpired(url.expiryDate));
  const expiredUrls = urls.filter(url => isExpired(url.expiryDate));

  if (urls.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body1">
          No shortened URLs yet. Create your first short URL above! 🚀
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Your Shortened URLs
        <Chip 
          label={`${urls.length}/5`} 
          size="small" 
          color={urls.length === 5 ? 'error' : 'primary'} 
        />
      </Typography>
      
      {/* Active URLs */}
      {activeUrls.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon fontSize="small" />
            Active URLs ({activeUrls.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeUrls.map((url, index) => (
              <Card key={url.id} elevation={1} sx={{ border: '1px solid', borderColor: 'success.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      URL #{urls.indexOf(url) + 1}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={<ScheduleIcon />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                      {onDelete && (
                        <Tooltip title="Delete this URL">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(url.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Original URL */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Original URL:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Link
                        href={url.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          wordBreak: 'break-all',
                          flex: 1,
                          minWidth: 0,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {url.originalUrl}
                      </Link>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Copy original URL">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(url.originalUrl, 'original')}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open original URL">
                          <IconButton
                            size="small"
                            onClick={() => handleRedirect(url.originalUrl)}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />                  {/* Short URL */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Short URL:
                    </Typography>                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Box
                        onClick={() => handleShortUrlClick(url.shortCode)}
                        sx={{ 
                          fontFamily: 'monospace',
                          backgroundColor: 'primary.50',
                          color: 'primary.main',
                          padding: '8px 12px',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'primary.light',
                          flex: 1,
                          minWidth: 0,
                          wordBreak: 'break-all',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': { 
                            backgroundColor: 'primary.100',
                            borderColor: 'primary.main',
                            transform: 'translateY(-1px)',
                            boxShadow: 1
                          }
                        }}
                      >
                        {url.shortUrl}
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem', mt: 0.5 }}>
                          Click to test redirect
                        </Typography>                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Copy short URL">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(url.shortUrl, 'short')}
                            color="primary"
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Tooltip title="Go to Link">
                        <IconButton
                          size="small"
                          onClick={() => window.open(url.shortUrl, '_blank')}
                          color="primary"
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Expiry Information */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {formatExpiryDate(url.expiryDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Valid for: {url.validityPeriod} minutes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Expired URLs */}
      {expiredUrls.length > 0 && (
        <Box>
          <Typography variant="subtitle1" color="error.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon fontSize="small" />
            Expired URLs ({expiredUrls.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {expiredUrls.map((url, index) => (
              <Card key={url.id} elevation={1} sx={{ border: '1px solid', borderColor: 'error.light', opacity: 0.7 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      URL #{urls.indexOf(url) + 1}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={<ScheduleIcon />}
                        label="Expired"
                        color="error"
                        size="small"
                      />
                      {onDelete && (
                        <Tooltip title="Delete this URL">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(url.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Short URL (expired):
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ 
                        fontFamily: 'monospace',
                        backgroundColor: 'grey.100',
                        padding: '8px 12px',
                        borderRadius: 1,
                        textDecoration: 'line-through'
                      }}
                    >
                      {url.shortUrl}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="error.main">
                    Expired: {formatExpiryDate(url.expiryDate)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Copy Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={
          copiedUrl.startsWith('short-') 
            ? "Short URL copied to clipboard!" 
            : "Original URL copied to clipboard!"
        }
        action={
          <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
            Close
          </Button>
        }
      />
    </Box>
  );
};

export default UrlResults;
