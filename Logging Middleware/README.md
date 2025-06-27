# Logging Middleware

A comprehensive logging solution integrated throughout the URL Shortener application that sends structured logs to the Afformed evaluation service.

## Overview

This logging middleware provides a reusable, type-safe logging system that captures application events, user interactions, errors, and performance metrics. All logs are sent to the Afformed test server with proper authentication.

## Features

- **Structured Logging**: Consistent log format with categorization
- **Type Safety**: Full TypeScript support with strict typing
- **Authentication**: Integrated Bearer token authentication
- **Error Handling**: Graceful fallback when logging service is unavailable
- **Comprehensive Coverage**: Logs across all application layers
- **Performance**: Non-blocking async logging
- **Rich Context**: Detailed error information and stack traces

## API Reference

### Core Logging Function

```typescript
Log(stack: Stack, level: Level, packageName: FrontendPackage, message: string): Promise<void>
```

**Parameters:**
- `stack`: "frontend" (for this frontend application)
- `level`: "debug" | "info" | "warn" | "error" | "fatal"
- `packageName`: "api" | "component" | "hook" | "page" | "state" | "style"
- `message`: Descriptive log message

### Convenience Functions

```typescript
// Level-specific logging
logDebug(packageName: FrontendPackage, message: string): Promise<void>
logInfo(packageName: FrontendPackage, message: string): Promise<void>
logWarn(packageName: FrontendPackage, message: string): Promise<void>
logError(packageName: FrontendPackage, message: string): Promise<void>
logFatal(packageName: FrontendPackage, message: string): Promise<void>

// Specialized logging utilities
logErrorWithContext(packageName: FrontendPackage, error: Error | unknown, context?: string): Promise<void>
logApiResponse(endpoint: string, status: number, success: boolean, responseTime?: number): Promise<void>
logComponentEvent(componentName: string, event: string, details?: string): Promise<void>
logUserInteraction(action: string, element: string, details?: string): Promise<void>
logValidationError(field: string, value: any, expectedType: string): Promise<void>
logStateChange(stateName: string, oldValue: any, newValue: any): Promise<void>
```

## Usage Examples

### Basic Logging

```typescript
import { logInfo, logError } from '../utils/logging';

// Simple info log
logInfo("component", "User created new short URL");

// Error logging
logError("api", "Failed to save URL to localStorage");
```

### Service Layer Logging

```typescript
import { logInfo, logError, logErrorWithContext } from '../utils/logging';

class UrlShortenerService {
  createShortUrl(formData: UrlFormData): Promise<ShortenedUrl> {
    logInfo("api", `Creating short URL for: ${formData.originalUrl}`);
    
    try {
      // Service logic...
      logInfo("api", `Short URL created successfully: ${shortUrl}`);
    } catch (error) {
      logErrorWithContext("api", error, "URL creation failed");
      throw error;
    }
  }
}
```

### Component Lifecycle Logging

```typescript
import { logComponentEvent, logUserInteraction } from '../utils/logging';

const UrlForm: React.FC = () => {
  React.useEffect(() => {
    logComponentEvent("UrlForm", "mounted");
    return () => logComponentEvent("UrlForm", "unmounted");
  }, []);

  const handleSubmit = () => {
    logUserInteraction("submitted", "URL form", formData.originalUrl);
    // Handle submission...
  };
};
```

### Validation Logging

```typescript
import { logValidationError } from '../utils/logging';

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    logValidationError("url", url, "valid URL");
    return false;
  }
};
```

### API Response Logging

```typescript
import { logApiResponse } from '../utils/logging';

const fetchGeolocation = async (): Promise<LocationData> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch('/api/geolocation');
    const responseTime = Date.now() - startTime;
    
    logApiResponse('/api/geolocation', response.status, response.ok, responseTime);
    
    return await response.json();
  } catch (error) {
    logApiResponse('/api/geolocation', 0, false, Date.now() - startTime);
    throw error;
  }
};
```

## Package Categories

### API Package
Used for service layer operations, data persistence, and external API calls.

**Examples:**
- URL creation/deletion
- LocalStorage operations
- External API calls (geolocation)
- Data validation

### Component Package
Used for UI component events, user interactions, and component lifecycle.

**Examples:**
- Component mounting/unmounting
- User form submissions
- Button clicks
- Input validation
- Copy operations

### Page Package
Used for page-level events and navigation.

**Examples:**
- Page navigation
- Route changes
- Major user flows
- Page-specific operations

### State Package
Used for state management and data flow tracking.

**Examples:**
- State changes
- Data updates
- Cache operations
- State synchronization

### Style Package
Used for styling and theming events (future use).

**Examples:**
- Theme changes
- Responsive breakpoint changes
- CSS-in-JS operations

### Hook Package
Used for custom React hooks (future use).

**Examples:**
- Custom hook initialization
- Hook state changes
- Effect dependencies

## Log Levels

### Debug
Detailed information for debugging purposes.
- Component lifecycle events
- State changes
- Detailed operation flows

### Info
General information about application flow.
- Successful operations
- User interactions
- Normal application events

### Warn
Warning conditions that don't stop operation.
- Deprecated function usage
- Missing optional data
- Fallback scenarios

### Error
Error conditions that affect functionality.
- Validation failures
- API errors
- Operation failures

### Fatal
Critical errors that may stop application.
- Application crashes
- Security violations
- Critical system failures

## Integration Points

### Service Layer
```typescript
// URL Shortener Service
- URL creation/deletion operations
- LocalStorage persistence
- Data validation
- Click tracking
- Statistics calculation
```

### React Components
```typescript
// All major components include logging:
- UrlForm: Form submissions, validation
- UrlResults: User interactions, copy operations
- StatisticsOverview: Data display events
- Navigation: Page navigation events
```

### Pages
```typescript
// Page-level logging:
- UrlShortenerPage: URL management operations
- StatisticsPage: Analytics viewing
- RedirectHandler: URL redirection events
```

### Utilities
```typescript
// Validation utilities:
- URL validation
- Short code validation
- Validity period validation
```

## Error Handling

The logging system is designed to be **fail-safe**:

1. **Network Errors**: Logged to console, application continues
2. **Service Unavailable**: Graceful degradation with console fallback
3. **Authentication Failures**: Logged as warnings, operation continues
4. **Invalid Data**: Validation before sending to prevent errors

```typescript
try {
  const response = await fetch('/logs', { ... });
  if (!response.ok) {
    console.warn('Failed to send log to server:', response.status);
    return; // Don't break application
  }
} catch (error) {
  console.warn('Error sending log to server:', error);
  // Application continues normally
}
```

## Authentication

The middleware uses Bearer token authentication with the Afformed evaluation service:

```typescript
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const response = await fetch('http://20.244.56.144/evaluation-service/logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  },
  body: JSON.stringify(logData)
});
```

## Performance Considerations

- **Async Operations**: All logging is non-blocking
- **Batch Processing**: Individual logs sent immediately (no batching to ensure delivery)
- **Error Resilience**: Logging failures don't affect application performance
- **Memory Efficient**: No local log storage or caching

## Configuration

### Server Endpoint
```typescript
const LOG_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';
```

### Request Format
```typescript
interface LogRequest {
  stack: "frontend";
  level: "debug" | "info" | "warn" | "error" | "fatal";
  package: "api" | "component" | "hook" | "page" | "state" | "style";
  message: string;
}
```

### Response Format
```typescript
interface LogResponse {
  logID: string;
  message: string;
}
```

## Best Practices

### 1. Meaningful Messages
```typescript
// Good
logInfo("api", "URL created successfully: abc123 -> https://example.com");

// Avoid
logInfo("api", "Operation completed");
```

### 2. Appropriate Log Levels
```typescript
// User interactions
logInfo("component", "User clicked copy button");

// Debug information
logDebug("component", "Form validation state changed");

// Errors
logError("api", "Failed to save to localStorage: QuotaExceededError");
```

### 3. Context in Error Logs
```typescript
try {
  // risky operation
} catch (error) {
  logErrorWithContext("api", error, "Creating short URL");
}
```

### 4. Consistent Package Usage
- Use "api" for all service layer operations
- Use "component" for UI interactions
- Use "page" for navigation and page-level events

## Testing

The logging system can be tested by:

1. **Console Verification**: Check browser console for fallback logs
2. **Network Tab**: Verify POST requests to logging endpoint
3. **Error Scenarios**: Test behavior when logging service is unavailable
4. **Authentication**: Verify Bearer token is included in requests

## Troubleshooting

### Common Issues

**1. Logs not appearing in server**
- Check network connectivity
- Verify authentication token is valid
- Check browser console for error messages

**2. TypeScript errors**
- Ensure proper package type is used
- Verify import statements are correct
- Check for missing function exports

**3. Performance impact**
- Logging is async and shouldn't block UI
- Check for console.warn messages about failures
- Verify no synchronous operations in logging code

### Debug Mode
Enable verbose logging by checking browser console:
```typescript
// All logging failures are logged to console
console.warn('Failed to send log to server:', response.status);
console.warn('Log data:', logData);
```

## File Structure

```
src/utils/logging/
├── index.ts       # Export all logging functions
├── logger.ts      # Main logging implementation
└── logger.d.ts    # TypeScript type definitions
```

## Dependencies

- **fetch**: For HTTP requests (built into modern browsers)
- **TypeScript**: For type safety and better development experience
- **No external dependencies**: Self-contained logging solution

---

This logging middleware provides comprehensive observability into the URL Shortener application while maintaining simplicity and performance. It's designed to be maintainable, extensible, and production-ready.
