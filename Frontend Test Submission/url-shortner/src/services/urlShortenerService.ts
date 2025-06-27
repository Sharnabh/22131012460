import { ShortenedUrl, UrlFormData, ClickData, UrlStatistics } from '../types';
import { validateUrl, validateShortCode, validateValidityPeriod } from '../utils/validation';
import { DEFAULT_VALIDITY_MINUTES, SHORT_CODE_LENGTH } from '../utils/constants';
import { logInfo, logError, logWarn, logDebug, logErrorWithContext, logApiResponse } from '../utils/logging';

class UrlShortenerService {
  private readonly STORAGE_KEY = 'shortened-urls';
  private shortenedUrls: ShortenedUrl[] = [];
  private usedShortCodes: Set<string> = new Set();
  constructor() {
    logInfo("api", "UrlShortenerService initializing");
    this.loadFromStorage();
    logInfo("api", "UrlShortenerService initialized successfully");
  }
  private loadFromStorage(): void {
    try {
      logDebug("api", "Loading URLs from localStorage");
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
        logInfo("api", `Loaded ${this.shortenedUrls.length} URLs from localStorage`);
      } else {
        logInfo("api", "No stored URLs found in localStorage");
      }
    } catch (error) {
      logErrorWithContext("api", error, "Error loading URLs from localStorage");
    }
  }  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.shortenedUrls));
      logDebug("api", `Saved ${this.shortenedUrls.length} URLs to localStorage`);
    } catch (error) {
      logErrorWithContext("api", error, "Error saving URLs to localStorage");
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
      logInfo("api", `Creating short URL for: ${formData.originalUrl}`);
      
      // Validate URL
      if (!validateUrl(formData.originalUrl)) {
        const errorMsg = 'Please enter a valid URL (e.g., https://example.com)';
        logError("api", `URL validation failed: ${formData.originalUrl}`);
        reject(new Error(errorMsg));
        return;
      }

      // Validate validity period
      const validityPeriod = formData.validityPeriod ? 
        parseInt(formData.validityPeriod) : DEFAULT_VALIDITY_MINUTES;
      
      if (formData.validityPeriod && !validateValidityPeriod(formData.validityPeriod)) {
        const errorMsg = 'Validity period must be between 1 and 10080 minutes (1 week)';
        logError("api", `Validity period validation failed: ${formData.validityPeriod}`);
        reject(new Error(errorMsg));
        return;
      }

      // Handle short code
      let shortCode = formData.preferredShortCode.trim();
      
      if (shortCode) {
        if (!validateShortCode(shortCode)) {
          const errorMsg = 'Short code must be 3-10 alphanumeric characters only';
          logError("api", `Short code validation failed: ${shortCode}`);
          reject(new Error(errorMsg));
          return;
        }
        if (this.usedShortCodes.has(shortCode.toLowerCase())) {
          const errorMsg = 'This short code is already taken. Please choose a different one.';
          logWarn("api", `Duplicate short code attempted: ${shortCode}`);
          reject(new Error(errorMsg));
          return;
        }
      } else {
        do {
          shortCode = this.generateShortCode();
        } while (this.usedShortCodes.has(shortCode.toLowerCase()));
        logDebug("api", `Generated short code: ${shortCode}`);
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
      
      logInfo("api", `Short URL created successfully: ${shortenedUrl.shortUrl} -> ${shortenedUrl.originalUrl}`);
      resolve(shortenedUrl);
    });
  }
  getShortenedUrls(): ShortenedUrl[] {
    return this.shortenedUrls;
  }  getOriginalUrl(shortCode: string, trackClick: boolean = true): string | null {
    logDebug("api", `Getting original URL for short code: ${shortCode}`);
    const url = this.shortenedUrls.find(url => 
      url.shortCode.toLowerCase() === shortCode.toLowerCase()
    );
    
    if (url && url.expiryDate > new Date()) {
      logInfo("api", `URL found and active: ${shortCode} -> ${url.originalUrl}`);
      // Track the click if requested (async, don't wait for it)
      if (trackClick) {
        this.trackClick(url.id).catch(error => {
          logErrorWithContext("api", error, "Failed to track click");
        });
      }
      
      return url.originalUrl;
    }
    
    if (url && url.expiryDate <= new Date()) {
      logWarn("api", `URL found but expired: ${shortCode}`);
    } else {
      logWarn("api", `URL not found: ${shortCode}`);
    }
    
    return null;
  }  private async trackClick(urlId: string): Promise<void> {
    const url = this.shortenedUrls.find(u => u.id === urlId);
    if (!url) {
      logError("api", `URL not found for tracking click: ${urlId}`);
      return;
    }

    logDebug("api", `Tracking click for URL: ${url.shortCode}`);

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
    
    logInfo("api", `Click tracked for ${url.shortCode}: ${url.clickCount} total clicks`);
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
  }  private async getApproximateLocation(): Promise<{ country?: string; city?: string; region?: string }> {
    try {
      logDebug("api", "Attempting to get IP-based location");
      // Try to get user's IP-based location using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        logInfo("api", "Successfully retrieved IP-based location");
        return {
          country: data.country_name || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        };
      } else {
        logWarn("api", `IP geolocation API failed with status: ${response.status}`);
      }
    } catch (error) {
      logErrorWithContext("api", error, "Failed to fetch IP geolocation");
    }

    // Fallback: Try to get browser geolocation (with user permission)
    try {
      logDebug("api", "Attempting to get browser geolocation");
      const position = await this.getBrowserGeolocation();
      if (position) {
        // Use reverse geocoding to get location name
        const locationName = await this.reverseGeocode(position.latitude, position.longitude);
        logInfo("api", "Successfully retrieved browser-based location");
        return locationName;
      }
    } catch (error) {
      logErrorWithContext("api", error, "Failed to get browser geolocation");
    }

    // Final fallback: Return unknown location
    logWarn("api", "Could not determine location, using fallback");
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
  private getBrowserGeolocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        logWarn("api", "Browser geolocation not available");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          logDebug("api", "Browser geolocation successful");
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          logErrorWithContext("api", error, "Browser geolocation error");
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
      logDebug("api", `Attempting reverse geocoding for coordinates: ${lat}, ${lng}`);
      // Using OpenStreetMap's Nominatim service for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        logInfo("api", "Reverse geocoding successful");
        return {
          country: address.country || 'Unknown',
          city: address.city || address.town || address.village || 'Unknown',
          region: address.state || address.region || 'Unknown'
        };
      } else {
        logWarn("api", `Reverse geocoding API failed with status: ${response.status}`);
      }
    } catch (error) {
      logErrorWithContext("api", error, "Reverse geocoding failed");
    }

    return {
      country: 'Unknown',
      city: 'Unknown', 
      region: 'Unknown'
    };
  }
  getStatistics(): UrlStatistics {
    logDebug("api", "Calculating URL statistics");
    const now = new Date();
    const activeUrls = this.shortenedUrls.filter(url => url.expiryDate > now);
    const expiredUrls = this.shortenedUrls.filter(url => url.expiryDate <= now);
    const totalClicks = this.shortenedUrls.reduce((sum, url) => sum + url.clickCount, 0);
    
    const mostClickedUrl = this.shortenedUrls.reduce((max, url) => 
      url.clickCount > (max?.clickCount || 0) ? url : max, 
      undefined as ShortenedUrl | undefined
    );

    const stats = {
      totalUrls: this.shortenedUrls.length,
      activeUrls: activeUrls.length,
      expiredUrls: expiredUrls.length,
      totalClicks,
      averageClicksPerUrl: this.shortenedUrls.length > 0 ? totalClicks / this.shortenedUrls.length : 0,
      mostClickedUrl
    };

    logInfo("api", `Statistics calculated: ${stats.totalUrls} total URLs, ${stats.activeUrls} active, ${stats.totalClicks} total clicks`);
    return stats;
  }  clearExpiredUrls(): void {
    const now = new Date();
    const beforeCount = this.shortenedUrls.length;
    this.shortenedUrls = this.shortenedUrls.filter(url => url.expiryDate > now);
    const afterCount = this.shortenedUrls.length;
    const removedCount = beforeCount - afterCount;
    
    // Rebuild the used short codes set
    this.usedShortCodes.clear();
    this.shortenedUrls.forEach(url => {
      this.usedShortCodes.add(url.shortCode.toLowerCase());
    });
    this.saveToStorage();
    
    if (removedCount > 0) {
      logInfo("api", `Cleared ${removedCount} expired URLs`);
    } else {
      logDebug("api", "No expired URLs to clear");
    }
  }

  deleteUrl(id: string): void {
    const urlToDelete = this.shortenedUrls.find(url => url.id === id);
    if (urlToDelete) {
      this.usedShortCodes.delete(urlToDelete.shortCode.toLowerCase());
      this.shortenedUrls = this.shortenedUrls.filter(url => url.id !== id);
      this.saveToStorage();
      logInfo("api", `URL deleted: ${urlToDelete.shortCode} (${urlToDelete.originalUrl})`);
    } else {
      logWarn("api", `Attempted to delete non-existent URL with ID: ${id}`);
    }
  }
}

export const urlShortenerService = new UrlShortenerService();
