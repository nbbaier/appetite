/**
 * Example: How to integrate external error monitoring services
 *
 * This file demonstrates how to configure external error monitoring
 * services like Sentry, LogRocket, or custom logging endpoints.
 */

import { setErrorMonitoringService, type ErrorMonitoringService } from './errorUtils';

// Example 1: Sentry integration
// npm install @sentry/react
/*
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE,
});

setErrorMonitoringService({
  captureError: (error, context) => {
    Sentry.captureException(error, {
      contexts: { additional: context },
    });
  },
  captureMessage: (message, level = 'info') => {
    Sentry.captureMessage(message, level);
  },
});
*/

// Example 2: LogRocket integration
// npm install logrocket
/*
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');

setErrorMonitoringService({
  captureError: (error, context) => {
    LogRocket.captureException(error as Error, {
      tags: context,
    });
  },
  captureMessage: (message, level = 'info') => {
    LogRocket.log(message, level);
  },
});
*/

// Example 3: Custom API endpoint
/*
setErrorMonitoringService({
  captureError: async (error, context) => {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
          } : String(error),
          context,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error('Failed to send error to monitoring service:', e);
    }
  },
  captureMessage: async (message, level = 'info') => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          level,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error('Failed to send message to monitoring service:', e);
    }
  },
});
*/

// Example 4: Disable monitoring (useful for testing)
/*
setErrorMonitoringService(null);
*/
