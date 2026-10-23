import {
  hasSensitiveQueryParam,
  redactSensitiveQueryParams,
} from './sensitiveQuery';

describe('redactSensitiveQueryParams', () => {
  it('redacts sensitive values and keeps the rest', () => {
    expect(
      redactSensitiveQueryParams({
        token: 'abc',
        email: 'a@b.dev',
        utm_source: 'email',
      }),
    ).toEqual({
      token: '[redacted]',
      email: '[redacted]',
      utm_source: 'email',
    });
  });

  it('returns an empty object for a missing query', () => {
    expect(redactSensitiveQueryParams(undefined)).toEqual({});
    expect(redactSensitiveQueryParams(null)).toEqual({});
  });
});

describe('hasSensitiveQueryParam', () => {
  it('detects a sensitive param', () => {
    expect(hasSensitiveQueryParam({ jt: 'abc', source: 'x' })).toBe(true);
    expect(hasSensitiveQueryParam({ utm_source: 'email' })).toBe(false);
  });
});
