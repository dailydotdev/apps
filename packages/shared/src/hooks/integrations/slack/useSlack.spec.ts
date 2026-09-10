import { renderHook } from '@testing-library/react';
import { useSlack } from './useSlack';
import { apiUrl } from '../../../lib/config';

describe('useSlack', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://app.daily.dev', href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should send the browser to the API authorize endpoint with the redirect path', () => {
    const { result } = renderHook(() => useSlack());

    result.current.connect({ redirectPath: '/squads/daily?param=a b' });

    const url = new URL(window.location.href);
    expect(url.origin + url.pathname).toBe(
      `${apiUrl}/integrations/slack/auth/authorize`,
    );
    expect(url.searchParams.get('redirectPath')).toBe(
      '/squads/daily?param=a b',
    );
  });
});
