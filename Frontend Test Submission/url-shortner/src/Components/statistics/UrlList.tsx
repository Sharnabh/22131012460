import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert
} from '@mui/material';
import { ShortenedUrl } from '../../types';
import UrlDetailCard from './UrlDetailCard';
import { isExpired } from '../../utils/validation';
import { logComponentEvent, logUserInteraction } from '../../utils/logging';

interface UrlListProps {
  urls: ShortenedUrl[];
}

type SortOption = 'newest' | 'oldest' | 'mostClicks' | 'leastClicks' | 'alphabetical';
type FilterOption = 'all' | 'active' | 'expired';

const UrlList: React.FC<UrlListProps> = ({ urls }) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    logComponentEvent("UrlList", "mounted", `${urls.length} URLs to display`);
  }, [urls.length]);

  React.useEffect(() => {
    if (searchTerm) {
      logUserInteraction("searched", "URL list", `term: ${searchTerm}`);
    }
  }, [searchTerm]);

  React.useEffect(() => {
    logUserInteraction("changed", "sort option", sortBy);
  }, [sortBy]);

  React.useEffect(() => {
    logUserInteraction("changed", "filter option", filterBy);
  }, [filterBy]);

  // Filter URLs
  const filteredUrls = urls.filter(url => {
    // Apply filter
    if (filterBy === 'active' && isExpired(url.expiryDate)) return false;
    if (filterBy === 'expired' && !isExpired(url.expiryDate)) return false;
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        url.originalUrl.toLowerCase().includes(searchLower) ||
        url.shortCode.toLowerCase().includes(searchLower) ||
        url.shortUrl.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Sort URLs
  const sortedUrls = [...filteredUrls].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'mostClicks':
        return b.clickCount - a.clickCount;
      case 'leastClicks':
        return a.clickCount - b.clickCount;
      case 'alphabetical':
        return a.originalUrl.localeCompare(b.originalUrl);
      default:
        return 0;
    }
  });

  if (urls.length === 0) {
    return (
      <Alert severity="info">
        <Typography variant="body1">
          No URLs have been created yet. Create your first URL to see statistics! 📊
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        URL Details ({urls.length})
      </Typography>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search URLs"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by URL or short code..."
          sx={{ minWidth: 200, flex: 1 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filterBy}
            label="Filter"
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
          >
            <MenuItem value="all">All URLs</MenuItem>
            <MenuItem value="active">Active Only</MenuItem>
            <MenuItem value="expired">Expired Only</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy}
            label="Sort by"
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="mostClicks">Most Clicks</MenuItem>
            <MenuItem value="leastClicks">Least Clicks</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results */}
      {sortedUrls.length === 0 ? (
        <Alert severity="info">
          <Typography variant="body2">
            No URLs match your current filter criteria.
          </Typography>
        </Alert>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {sortedUrls.length} of {urls.length} URLs
          </Typography>
          
          {sortedUrls.map((url, index) => (
            <UrlDetailCard 
              key={url.id} 
              url={url} 
              index={urls.findIndex(u => u.id === url.id)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UrlList;
