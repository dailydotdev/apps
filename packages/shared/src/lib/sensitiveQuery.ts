export const SENSITIVE_QUERY_PARAMS = [
  'code',
  'email',
  'jt',
  'otp',
  'password',
  'secret',
  'sig',
  'state',
  'token',
] as const;

export const REDACTED_VALUE = '[redacted]';

export const hasSensitiveQueryParam = (
  query: Record<string, unknown>,
): boolean =>
  SENSITIVE_QUERY_PARAMS.some((param) => typeof query[param] !== 'undefined');

export const redactSensitiveQueryParams = <T extends Record<string, unknown>>(
  query: T | null | undefined,
): T => {
  if (!query || typeof query !== 'object') {
    return {} as T;
  }

  return Object.keys(query).reduce(
    (acc, key) =>
      (SENSITIVE_QUERY_PARAMS as readonly string[]).includes(key)
        ? { ...acc, [key]: REDACTED_VALUE }
        : acc,
    query,
  );
};
