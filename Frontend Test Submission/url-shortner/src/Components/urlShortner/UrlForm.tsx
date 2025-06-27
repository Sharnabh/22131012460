import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Info as InfoIcon } from '@mui/icons-material';
import { UrlFormData, ShortenedUrl } from '../../types';
import { DEFAULT_VALIDITY_MINUTES } from '../../utils/constants';

interface UrlFormProps {
  onSubmit: (formData: UrlFormData) => Promise<ShortenedUrl>;
  disabled?: boolean;
  urlCount: number;
}

const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, disabled = false, urlCount }) => {
  const [formData, setFormData] = useState<UrlFormData>({
    originalUrl: '',
    validityPeriod: '',
    preferredShortCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof UrlFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.originalUrl.trim()) {
      setError('Please enter a URL to shorten');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      setFormData({
        originalUrl: '',
        validityPeriod: '',
        preferredShortCode: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the short URL');
    } finally {
      setLoading(false);
    }
  };

  const remainingUrls = 5 - urlCount;

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Create Short URL
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {remainingUrls} of 5 remaining
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Original URL"
            value={formData.originalUrl}
            onChange={handleInputChange('originalUrl')}
            placeholder="https://example.com/your-very-long-url"
            margin="normal"
            required
            disabled={disabled || loading}
            helperText="Enter the URL you want to shorten"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  🔗
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Validity Period (minutes)"
              value={formData.validityPeriod}
              onChange={handleInputChange('validityPeriod')}
              placeholder={DEFAULT_VALIDITY_MINUTES.toString()}
              type="number"
              sx={{ flex: 1 }}
              disabled={disabled || loading}
              helperText={`Default: ${DEFAULT_VALIDITY_MINUTES} minutes`}
              InputProps={{
                inputProps: { min: 1, max: 10080 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Maximum: 10080 minutes (1 week)">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Custom Short Code"
              value={formData.preferredShortCode}
              onChange={handleInputChange('preferredShortCode')}
              placeholder="mycode123"
              sx={{ flex: 1 }}
              disabled={disabled || loading}
              helperText="3-10 alphanumeric characters (optional)"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Leave empty for auto-generated code">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {disabled && remainingUrls === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have reached the maximum limit of 5 URLs. Please delete some URLs to create new ones.
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            disabled={disabled || loading || remainingUrls === 0}
            sx={{ mt: 3, minHeight: 48 }}
            fullWidth
          >
            {loading ? 'Creating Short URL...' : 'Create Short URL'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UrlForm;
