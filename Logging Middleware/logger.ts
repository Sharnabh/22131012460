/**
 * Logging Middleware for URL Shortener Application
 * Provides a reusable logging function that sends logs to the test server
 */

// Valid values for the logging API
type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";

interface LogRequest {
  stack: Stack;
  level: Level;
  package: FrontendPackage;
  message: string;
}

interface LogResponse {
  logID: string;
  message: string;
}

// Authentication token for the test server
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaGFybmFiaC4yMnNjc2UxMDEyNjQ2QGdhbGdvdGlhc3VuaXZlcnNpdHkuZWR1LmluIiwiZXhwIjoxNzUxMDEzMTAwLCJpYXQiOjE3NTEwMTIyMDAsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI3Njk0Nzg5ZS04OTZlLTQxMTQtODY1Yi0zY2I1YjVjODMzNjIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzaGFybmFiaCBiYW5lcmplZSIsInN1YiI6IjFkYmY2YWQyLWZiODQtNGUyZS05ZThjLWU3NzBkNWM5NDk5MiJ9LCJlbWFpbCI6InNoYXJuYWJoLjIyc2NzZTEwMTI2NDZAZ2FsZ290aWFzdW5pdmVyc2l0eS5lZHUuaW4iLCJuYW1lIjoic2hhcm5hYmggYmFuZXJqZWUiLCJyb2xsTm8iOiIyMjEzMTAxMjQ2MCIsImFjY2Vzc0NvZGUiOiJNdWFndnEiLCJjbGllbnRJRCI6IjFkYmY2YWQyLWZiODQtNGUyZS05ZThjLWU3NzBkNWM5NDk5MiIsImNsaWVudFNlY3JldCI6InZudWd3d1JmQVVYYVB4cVIifQ.yH_QrfZELe8kdrCd9Nnto8zTyMCsbi0IGwUUPYhVmHk";

/**
 * Main logging function that sends logs to the test server
 * @param stack - "frontend" for this frontend application
 * @param level - Log level: "debug", "info", "warn", "error", "fatal"
 * @param packageName - Package name: "api", "component", "hook", "page", "state", "style"
 * @param message - Log message
 */
export const Log = async (
  stack: Stack,
  level: Level,
  packageName: FrontendPackage,
  message: string
): Promise<void> => {
  const logData: LogRequest = {
    stack,
    level,
    package: packageName,
    message
  };

  try {
    const response = await fetch('http://20.244.56.144/evaluation-service/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(logData)
    });

    if (!response.ok) {
      // If logging fails, we should still continue application execution
      // but we can fallback to console logging for debugging purposes
      console.warn('Failed to send log to server:', response.status, response.statusText);
      console.warn('Log data:', logData);
      return;
    }

    const result: LogResponse = await response.json();
    // Optional: You could store the logID if needed for tracking
    
  } catch (error) {
    // Network or other errors - don't break the application
    console.warn('Error sending log to server:', error);
    console.warn('Log data:', logData);
  }
};

/**
 * Convenience functions for different log levels
 */
export const logDebug = (packageName: FrontendPackage, message: string) => 
  Log("frontend", "debug", packageName, message);

export const logInfo = (packageName: FrontendPackage, message: string) => 
  Log("frontend", "info", packageName, message);

export const logWarn = (packageName: FrontendPackage, message: string) => 
  Log("frontend", "warn", packageName, message);

export const logError = (packageName: FrontendPackage, message: string) => 
  Log("frontend", "error", packageName, message);

export const logFatal = (packageName: FrontendPackage, message: string) => 
  Log("frontend", "fatal", packageName, message);

/**
 * Utility function to log errors with more context
 */
export const logErrorWithContext = (
  packageName: FrontendPackage, 
  error: Error | unknown, 
  context?: string
) => {
  let message = '';
  
  if (context) {
    message += `${context}: `;
  }
  
  if (error instanceof Error) {
    message += `${error.name} - ${error.message}`;
    if (error.stack) {
      message += ` | Stack: ${error.stack.split('\n')[1]?.trim() || 'N/A'}`;
    }
  } else {
    message += `Unknown error: ${String(error)}`;
  }
  
  logError(packageName, message);
};

/**
 * Utility function to log API responses
 */
export const logApiResponse = (
  endpoint: string, 
  status: number, 
  success: boolean,
  responseTime?: number
) => {
  const message = `API ${endpoint} - Status: ${status}, Success: ${success}${
    responseTime ? `, Response Time: ${responseTime}ms` : ''
  }`;
  
  if (success) {
    logInfo("api", message);
  } else {
    logError("api", message);
  }
};

/**
 * Utility function to log component lifecycle events
 */
export const logComponentEvent = (
  componentName: string, 
  event: string, 
  details?: string
) => {
  const message = `${componentName} - ${event}${details ? `: ${details}` : ''}`;
  logDebug("component", message);
};

/**
 * Utility function to log user interactions
 */
export const logUserInteraction = (
  action: string, 
  element: string, 
  details?: string
) => {
  const message = `User ${action} on ${element}${details ? `: ${details}` : ''}`;
  logInfo("component", message);
};

/**
 * Utility function to log validation errors
 */
export const logValidationError = (
  field: string, 
  value: any, 
  expectedType: string
) => {
  const message = `Validation failed for ${field}: received ${typeof value} (${String(value)}), expected ${expectedType}`;
  logError("component", message);
};

/**
 * Utility function to log state changes
 */
export const logStateChange = (
  stateName: string, 
  oldValue: any, 
  newValue: any
) => {
  const message = `State change - ${stateName}: ${String(oldValue)} -> ${String(newValue)}`;
  logDebug("state", message);
};

export default Log;
