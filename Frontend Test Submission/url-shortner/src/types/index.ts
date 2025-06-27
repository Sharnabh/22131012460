export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  validityPeriod: number;
  expiryDate: Date;
  createdAt: Date;
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
