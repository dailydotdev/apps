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
  response: { errors: { extensions: { code: ApiError } }[] };
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
