import { ShortenedUrl, UrlFormData } from '../types';
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
        // Convert date strings back to Date objects
        this.shortenedUrls = urls.map((url: any) => ({
          ...url,
          expiryDate: new Date(url.expiryDate),
          createdAt: new Date(url.createdAt)
        }));
        // Rebuild the used short codes set
        this.shortenedUrls.forEach(url => {
          this.usedShortCodes.add(url.shortCode.toLowerCase());
        });
        console.log('Loaded URLs from storage:', this.shortenedUrls);
      }
    } catch (error) {
      console.error('Error loading URLs from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.shortenedUrls));
      console.log('Saved URLs to storage:', this.shortenedUrls);
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
      }

      // Create shortened URL
      const now = new Date();
      const expiryDate = new Date(now.getTime() + validityPeriod * 60000);
      
      const shortenedUrl: ShortenedUrl = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        originalUrl: formData.originalUrl,
        shortCode,
        shortUrl: `${window.location.origin}/${shortCode}`,
        validityPeriod,
        expiryDate,
        createdAt: now
      };      this.shortenedUrls.push(shortenedUrl);
      this.usedShortCodes.add(shortCode.toLowerCase());
      this.saveToStorage();
      
      resolve(shortenedUrl);
    });
  }

  getShortenedUrls(): ShortenedUrl[] {
    return this.shortenedUrls;
  }
  getOriginalUrl(shortCode: string): string | null {
    console.log('Looking for shortCode:', shortCode);
    console.log('Available URLs:', this.shortenedUrls.map(u => ({ shortCode: u.shortCode, expired: u.expiryDate < new Date() })));
    
    const url = this.shortenedUrls.find(url => 
      url.shortCode.toLowerCase() === shortCode.toLowerCase()
    );
    
    if (url) {
      console.log('Found URL:', url);
      if (url.expiryDate > new Date()) {
        console.log('URL is valid, redirecting to:', url.originalUrl);
        return url.originalUrl;
      } else {
        console.log('URL has expired');
      }
    } else {
      console.log('URL not found');
    }
    return null;
  }  clearExpiredUrls(): void {
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
