import { LogLevel } from '@nestjs/common';

// Keep logging quiet by default, or select normal or detailed Nest logs at startup.
export function loggingOptions(value = process.env.LOG_LEVEL): false | LogLevel[] {
  switch (value) {
    case undefined:
    case 'off': return false;
    case 'error': return ['error'];
    case 'info': return ['error', 'warn', 'log'];
    case 'debug': return ['error', 'warn', 'log', 'debug', 'verbose'];
    default: throw new Error('LOG_LEVEL must be off, error, info, or debug');
  }
}
