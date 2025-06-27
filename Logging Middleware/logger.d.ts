/**
 * Type definitions for the Logging Middleware
 */

export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";

export interface LogRequest {
  stack: Stack;
  level: Level;
  package: FrontendPackage;
  message: string;
}

export interface LogResponse {
  logID: string;
  message: string;
}

export declare const Log: (
  stack: Stack,
  level: Level,
  packageName: FrontendPackage,
  message: string
) => Promise<void>;

export declare const logDebug: (packageName: FrontendPackage, message: string) => Promise<void>;
export declare const logInfo: (packageName: FrontendPackage, message: string) => Promise<void>;
export declare const logWarn: (packageName: FrontendPackage, message: string) => Promise<void>;
export declare const logError: (packageName: FrontendPackage, message: string) => Promise<void>;
export declare const logFatal: (packageName: FrontendPackage, message: string) => Promise<void>;

export declare const logErrorWithContext: (
  packageName: FrontendPackage,
  error: Error | unknown,
  context?: string
) => Promise<void>;

export declare const logApiResponse: (
  endpoint: string,
  status: number,
  success: boolean,
  responseTime?: number
) => Promise<void>;

export declare const logComponentEvent: (
  componentName: string,
  event: string,
  details?: string
) => Promise<void>;

export declare const logUserInteraction: (
  action: string,
  element: string,
  details?: string
) => Promise<void>;

export declare const logValidationError: (
  field: string,
  value: any,
  expectedType: string
) => Promise<void>;

export declare const logStateChange: (
  stateName: string,
  oldValue: any,
  newValue: any
) => Promise<void>;

export default Log;
