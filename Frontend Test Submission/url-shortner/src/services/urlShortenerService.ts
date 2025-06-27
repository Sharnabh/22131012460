import { ShortenedUrl, UrlFormData, ClickData, UrlStatistics } from '../types';
import { validateUrl, validateShortCode, validateValidityPeriod } from '../utils/validation';
import { DEFAULT_VALIDITY_MINUTES, SHORT_CODE_LENGTH } from '../utils/constants';

class UrlShortenerService {
  private readonly STORAGE_KEY = 'shortened-urls';
  private shortenedUrls: ShortenedUrl[] = [];
  private usedShortCodes: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const urls = JSON.parse(stored);
        // Convert date strings back to Date objects and ensure click data exists
        this.shortenedUrls = urls.map((url: any) => ({
          ...url,
          expiryDate: new Date(url.expiryDate),
          createdAt: new Date(url.createdAt),
          clickCount: url.clickCount || 0,
          clicks: (url.clicks || []).map((click: any) => ({
            ...click,
            timestamp: new Date(click.timestamp)
          }))
        }));
        // Rebuild the used short codes set
        this.shortenedUrls.forEach(url => {
          this.usedShortCodes.add(url.shortCode.toLowerCase());
        });
      }
    } catch (error) {
      console.error('Error loading URLs from storage:', error);
    }
  }
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.shortenedUrls));
    } catch (error) {
      console.error('Error saving URLs to storage:', error);
    }
  }

  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  createShortUrl(formData: UrlFormData): Promise<ShortenedUrl> {
    return new Promise((resolve, reject) => {
      // Validate URL
      if (!validateUrl(formData.originalUrl)) {
        reject(new Error('Please enter a valid URL (e.g., https://example.com)'));
        return;
      }

      // Validate validity period
      const validityPeriod = formData.validityPeriod ? 
        parseInt(formData.validityPeriod) : DEFAULT_VALIDITY_MINUTES;
      
      if (formData.validityPeriod && !validateValidityPeriod(formData.validityPeriod)) {
        reject(new Error('Validity period must be between 1 and 10080 minutes (1 week)'));
        return;
      }

      // Handle short code
      let shortCode = formData.preferredShortCode.trim();
      
      if (shortCode) {
        if (!validateShortCode(shortCode)) {
          reject(new Error('Short code must be 3-10 alphanumeric characters only'));
          return;
        }
        if (this.usedShortCodes.has(shortCode.toLowerCase())) {
          reject(new Error('This short code is already taken. Please choose a different one.'));
          return;
        }
      } else {
        do {
          shortCode = this.generateShortCode();
        } while (this.usedShortCodes.has(shortCode.toLowerCase()));
      }      // Create shortened URL
      const now = new Date();
      const expiryDate = new Date(now.getTime() + validityPeriod * 60000);
      
      const shortenedUrl: ShortenedUrl = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        originalUrl: formData.originalUrl,
        shortCode,
        shortUrl: `${window.location.origin}/${shortCode}`,
        validityPeriod,
        expiryDate,
        createdAt: now,
        clickCount: 0,
        clicks: []
      };

      this.shortenedUrls.push(shortenedUrl);
      this.usedShortCodes.add(shortCode.toLowerCase());
      this.saveToStorage();
      
      resolve(shortenedUrl);
    });
  }
  getShortenedUrls(): ShortenedUrl[] {
    return this.shortenedUrls;
  }
  getOriginalUrl(shortCode: string, trackClick: boolean = true): string | null {
    const url = this.shortenedUrls.find(url => 
      url.shortCode.toLowerCase() === shortCode.toLowerCase()
    );
    
    if (url && url.expiryDate > new Date()) {
      // Track the click if requested (async, don't wait for it)
      if (trackClick) {
        this.trackClick(url.id).catch(error => {
          console.warn('Failed to track click:', error);
        });
      }
      
      return url.originalUrl;
    }
    
    return null;
  }
  private async trackClick(urlId: string): Promise<void> {
    const url = this.shortenedUrls.find(u => u.id === urlId);
    if (!url) return;

    // Get location asynchronously
    const location = await this.getApproximateLocation();

    const clickData: ClickData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      source: this.getClickSource(),
      userAgent: navigator.userAgent,
      location
    };

    url.clicks.push(clickData);
    url.clickCount = url.clicks.length;
    this.saveToStorage();
  }

  private getClickSource(): string {
    if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        return referrerUrl.hostname;
      } catch {
        return 'Unknown referrer';
      }
    }
    return 'Direct access';
  }
  private async getApproximateLocation(): Promise<{ country?: string; city?: string; region?: string }> {
    try {
      // Try to get user's IP-based location using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        };
      }
    } catch (error) {
      console.warn('Failed to fetch IP geolocation:', error);
    }

    // Fallback: Try to get browser geolocation (with user permission)
    try {
      const position = await this.getBrowserGeolocation();
      if (position) {
        // Use reverse geocoding to get location name
        const locationName = await this.reverseGeocode(position.latitude, position.longitude);
        return locationName;
      }
    } catch (error) {
      console.warn('Failed to get browser geolocation:', error);
    }

    // Final fallback: Return unknown location
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }

  private getBrowserGeolocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        {
          timeout: 5000,
          enableHighAccuracy: false
        }
      );
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<{ country?: string; city?: string; region?: string }> {
    try {
      // Using OpenStreetMap's Nominatim service for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        return {
          country: address.country || 'Unknown',
          city: address.city || address.town || address.village || 'Unknown',
          region: address.state || address.region || 'Unknown'
        };
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }

    return {
      country: 'Unknown',
      city: 'Unknown', 
      region: 'Unknown'
    };
  }

  getStatistics(): UrlStatistics {
    const now = new Date();
    const activeUrls = this.shortenedUrls.filter(url => url.expiryDate > now);
    const expiredUrls = this.shortenedUrls.filter(url => url.expiryDate <= now);
    const totalClicks = this.shortenedUrls.reduce((sum, url) => sum + url.clickCount, 0);
    
    const mostClickedUrl = this.shortenedUrls.reduce((max, url) => 
      url.clickCount > (max?.clickCount || 0) ? url : max, 
      undefined as ShortenedUrl | undefined
    );

    return {
      totalUrls: this.shortenedUrls.length,
      activeUrls: activeUrls.length,
      expiredUrls: expiredUrls.length,
      totalClicks,
      averageClicksPerUrl: this.shortenedUrls.length > 0 ? totalClicks / this.shortenedUrls.length : 0,
      mostClickedUrl
    };
  }clearExpiredUrls(): void {
    const now = new Date();
    this.shortenedUrls = this.shortenedUrls.filter(url => url.expiryDate > now);
    // Rebuild the used short codes set
    this.usedShortCodes.clear();
    this.shortenedUrls.forEach(url => {
      this.usedShortCodes.add(url.shortCode.toLowerCase());
    });
    this.saveToStorage();
  }

  deleteUrl(id: string): void {
    const urlToDelete = this.shortenedUrls.find(url => url.id === id);
    if (urlToDelete) {
      this.usedShortCodes.delete(urlToDelete.shortCode.toLowerCase());
      this.shortenedUrls = this.shortenedUrls.filter(url => url.id !== id);
      this.saveToStorage();
    }
  }
}

export const urlShortenerService = new UrlShortenerService();
