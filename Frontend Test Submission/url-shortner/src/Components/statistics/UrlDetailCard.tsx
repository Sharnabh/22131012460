import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Schedule as ScheduleIcon,
  Mouse as MouseIcon,
  Launch as LaunchIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { ShortenedUrl, ClickData } from '../../types';
import { formatExpiryDate, isExpired } from '../../utils/validation';

interface UrlDetailCardProps {
  url: ShortenedUrl;
  index: number;
}

const UrlDetailCard: React.FC<UrlDetailCardProps> = ({ url, index }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const formatClickTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  const getSourceDisplay = (source: string) => {
    if (source === 'Direct access') {
      return (
        <Chip 
          label="Direct" 
          size="small" 
          color="default"
          variant="outlined"
        />
      );
    }
    return (
      <Chip 
        label={source} 
        size="small" 
        color="primary"
        variant="outlined"
      />
    );
  };
  const getLocationDisplay = (click: ClickData) => {
    if (click.location) {
      const { city, region, country } = click.location;
      if (city === 'Unknown' && region === 'Unknown' && country === 'Unknown') {
        return 'Location unavailable';
      }
      return `${city}, ${region}, ${country}`.replace(/Unknown,?\s?/g, '').replace(/,\s*$/, '') || 'Unknown Location';
    }
    return 'Determining location...';
  };

  return (
    <Card elevation={1} sx={{ mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              URL #{index + 1}
            </Typography>
            
            {/* Short URL */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Short URL:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontFamily: 'monospace',
                  backgroundColor: 'primary.50',
                  color: 'primary.main',
                  padding: '4px 8px',
                  borderRadius: 1,
                  flex: 1
                }}
              >
                {url.shortUrl}
              </Typography>
              <Tooltip title="Open original URL">
                <IconButton
                  size="small"
                  onClick={() => window.open(url.originalUrl, '_blank')}
                >
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Original URL */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Original URL:
            </Typography>
            <Link
              href={url.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                wordBreak: 'break-all',
                display: 'block',
                mb: 2,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {url.originalUrl}
            </Link>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip
              icon={<ScheduleIcon />}
              label={isExpired(url.expiryDate) ? 'Expired' : 'Active'}
              color={isExpired(url.expiryDate) ? 'error' : 'success'}
              size="small"
            />
            <Chip
              icon={<MouseIcon />}
              label={`${url.clickCount} clicks`}
              color="primary"
              size="small"
            />
          </Box>
        </Box>

        {/* Dates */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Created: {formatExpiryDate(url.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expires: {formatExpiryDate(url.expiryDate)}
          </Typography>
        </Box>

        {/* Click Details Toggle */}
        {url.clicks.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Click Details ({url.clicks.length})
              </Typography>
              <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
                size="small"
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {url.clicks
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((click, clickIndex) => (
                      <TableRow key={click.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {formatClickTimestamp(click.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getSourceDisplay(click.source)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {getLocationDisplay(click)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </Box>
        )}

        {url.clicks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No clicks recorded yet
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UrlDetailCard;
