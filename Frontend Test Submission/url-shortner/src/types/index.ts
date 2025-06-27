export interface ClickData {
  id: string;
  timestamp: Date;
  source: string; // referrer or direct
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  validityPeriod: number;
  expiryDate: Date;
  createdAt: Date;
  clickCount: number;
  clicks: ClickData[];
}

export interface UrlFormData {
  originalUrl: string;
  validityPeriod: string;
  preferredShortCode: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface UrlStatistics {
  totalUrls: number;
  activeUrls: number;
  expiredUrls: number;
  totalClicks: number;
  averageClicksPerUrl: number;
  mostClickedUrl?: ShortenedUrl;
}
