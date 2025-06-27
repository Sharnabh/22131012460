export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateShortCode = (shortCode: string): boolean => {
  const regex = /^[A-Za-z0-9]{3,10}$/;
  return regex.test(shortCode);
};

export const validateValidityPeriod = (period: string): boolean => {
  const num = parseInt(period);
  return !isNaN(num) && num >= 1 && num <= 10080; // max 1 week
};

export const formatExpiryDate = (date: Date): string => {
  return date.toLocaleString();
};

export const isExpired = (expiryDate: Date): boolean => {
  return expiryDate < new Date();
};
