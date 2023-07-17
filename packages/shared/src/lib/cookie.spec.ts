import { expireCookie, setCookie } from './cookie';

describe('cookie', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('should set', () => {
    setCookie('foo', 'bar');

    expect(document.cookie).toBe('foo=bar');
  });

  it('should set with options', () => {
    setCookie('foo', 'bar', {
      domain: 'daily.dev',
      maxAge: 60 * 60 * 24 * 365 * 10,
      partitioned: true,
      path: '/',
      sameSite: 'strict',
    });

    expect(document.cookie).toBe(
      'foo=bar; domain=daily.dev; max-age=315360000; partitioned; path=/; samesite=strict',
    );
  });

  it('should set with expires', () => {
    setCookie('foo', 'bar', {
      path: '/',
      expires: new Date('2021-01-01'),
    });

    expect(document.cookie).toBe(
      'foo=bar; expires=Fri, 01 Jan 2021 00:00:00 GMT; path=/',
    );
  });

  it('should set with boolean option', () => {
    setCookie('foo', 'bar', {
      path: '/',
      secure: true,
    });

    expect(document.cookie).toBe('foo=bar; path=/; secure');
  });

  it('should not set with boolean option', () => {
    setCookie('foo', 'bar', {
      path: '/',
      secure: false,
    });

    expect(document.cookie).toBe('foo=bar; path=/');
  });

  it('should encode value', () => {
    setCookie('foo', JSON.stringify({ bar: true }), {
      path: '/',
      secure: false,
    });

    expect(document.cookie).toBe(
      `foo=${encodeURIComponent(JSON.stringify({ bar: true }))}; path=/`,
    );
  });

  it('should not set undefined option', () => {
    setCookie('foo', 'bar', {
      path: undefined,
      secure: true,
      sameSite: 'strict',
    });

    expect(document.cookie).toBe(`foo=bar; samesite=strict; secure`);
  });

  it('should throw if name or value is not provided', () => {
    expect(() => setCookie('', 'bar')).toThrow();
    expect(() => setCookie('foo', '')).toThrow();
    expect(() => setCookie(undefined, undefined)).toThrow();
  });

  it('should expire cookie', () => {
    expireCookie('foo');

    expect(document.cookie).toBe('foo=expired; max-age=0');
  });

  it('should expire cookie with options', () => {
    expireCookie('foo', {
      path: '/',
      domain: 'daily.dev',
    });

    expect(document.cookie).toBe(
      'foo=expired; domain=daily.dev; max-age=0; path=/',
    );
  });
});
