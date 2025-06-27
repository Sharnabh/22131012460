import { logValidationError } from './logging';

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    logValidationError("url", url, "valid URL");
    return false;
  }
};

export const validateShortCode = (shortCode: string): boolean => {
  const regex = /^[A-Za-z0-9]{3,10}$/;
  const isValid = regex.test(shortCode);
  if (!isValid) {
    logValidationError("shortCode", shortCode, "3-10 alphanumeric characters");
  }
  return isValid;
};

export const validateValidityPeriod = (period: string): boolean => {
  const num = parseInt(period);
  const isValid = !isNaN(num) && num >= 1 && num <= 10080; // max 1 week
  if (!isValid) {
    logValidationError("validityPeriod", period, "number between 1 and 10080");
  }
  return isValid;
};

export const formatExpiryDate = (date: Date): string => {
  return date.toLocaleString();
};

export const isExpired = (expiryDate: Date): boolean => {
  return expiryDate < new Date();
};
