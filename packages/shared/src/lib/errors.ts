import type { ApiError } from '../graphql/common';

export class HttpError extends Error {
  public url: string;

  public statusCode: number;

  public response: string;

  constructor(url: string, status: number, response: string) {
    super(`Unexpected status code: ${status}`);

    this.name = 'HttpError';
    this.url = url;
    this.statusCode = status;
    this.response = response;
  }
}

export type GraphQLError = {
  response: { errors: { extensions: { code: ApiError }; message?: string }[] };
};

export const isConnectionError = (error: Error | unknown): boolean => {
  // Check browser's online status first
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  if (!error) {
    return false;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : '';

  // Network-related error patterns
  const connectionErrorPatterns = [
    'Failed to fetch',
    'Network request failed',
    'NetworkError',
    'Network Error',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_NETWORK_CHANGED',
    'ERR_CONNECTION_REFUSED',
    'ERR_CONNECTION_RESET',
    'ERR_CONNECTION_CLOSED',
    'ERR_CONNECTION_TIMED_OUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'offline',
  ];

  return connectionErrorPatterns.some(
    (pattern) => errorMessage.includes(pattern) || errorName.includes(pattern),
  );
};

export interface LogErrorDetails {
  message?: string;
  name?: string;
  code?: string;
}

const maxLogErrorLength = 500;

const toLogString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.slice(0, maxLogErrorLength);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
};

/**
 * An error in a shape that survives `JSON.stringify`. `Error` keeps its
 * message, name and code on non-enumerable or prototype properties, so
 * stringifying one directly logs `{}`, and `undefined` drops the field.
 */
export const getLogErrorDetails = (
  error: unknown,
): LogErrorDetails | undefined => {
  if (error === null || typeof error === 'undefined') {
    return undefined;
  }

  const primitive = toLogString(error);
  if (primitive) {
    return { message: primitive };
  }

  if (typeof error !== 'object') {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  const details: LogErrorDetails = {
    message:
      toLogString(record.message) ??
      toLogString(record.detail) ??
      toLogString(record.reason) ??
      toLogString(record.description),
    name: toLogString(record.name) ?? toLogString(record.type),
    code: toLogString(record.code) ?? toLogString(record.status),
  };

  if (!details.message && !details.name && !details.code) {
    return undefined;
  }

  return details;
};
