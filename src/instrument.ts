// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { appConfig } from './configuration/app.config';

Sentry.init({
  dsn: appConfig.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  debug: false,
});

Sentry.profiler.startProfiler();

// // Starts a transaction that will also be profiled
// Sentry.startSpan(
//   {
//     name: 'HireX transaction',
//   },
//   () => {
//     // the code executing inside the transaction will be wrapped in a span and profiled
//   },
// );

Sentry.profiler.stopProfiler();
