/**
 * Production-safe logging utility
 * - Errors: Always logged (for production monitoring)
 * - Warnings: Only in development
 * - Debug/Info: Only in development
 */
export const logger = {
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.warn(message, ...args);
    }
  },

  log: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.log(message, ...args);
    }
  },
};
