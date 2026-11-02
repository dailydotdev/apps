import React from 'react';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { useFeedWidgetTips } from './tips';

const chrome =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const edge = `${chrome} Edg/130.0.0.0`;
const firefox =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0';
const safari =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';

type RuntimeWindow = Window & { webkit?: unknown };

const setUserAgent = (userAgent: string) =>
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent);

const renderTips = ({ isAndroidApp = false } = {}) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider client={new QueryClient()} auth={{ isAndroidApp }}>
      {children}
    </TestBootProvider>
  );

  return renderHook(() => useFeedWidgetTips(), { wrapper }).result.current;
};

const extensionTip = (tips: ReturnType<typeof useFeedWidgetTips>) =>
  tips.find((tip) => tip.id === 'extension');

afterEach(() => {
  jest.restoreAllMocks();
  delete (window as RuntimeWindow).webkit;
  document.documentElement.classList.remove('ios');
});

describe('useFeedWidgetTips', () => {
  it('keeps the extension tip in Chrome', () => {
    setUserAgent(chrome);

    expect(extensionTip(renderTips())?.cta).toBe('Add to Chrome');
  });

  it('names Edge in Edge', () => {
    setUserAgent(edge);

    expect(extensionTip(renderTips())?.cta).toBe('Add to Edge');
  });

  it.each([
    ['Firefox', firefox],
    ['Safari', safari],
  ])('leaves the extension tip out of %s', (_, userAgent) => {
    setUserAgent(userAgent);

    expect(extensionTip(renderTips())).toBeUndefined();
  });

  it('leaves the extension tip out of the Android app', () => {
    setUserAgent(chrome);

    expect(extensionTip(renderTips({ isAndroidApp: true }))).toBeUndefined();
  });

  it('leaves the extension tip out of the iOS app', () => {
    setUserAgent(safari.replace('Version/18.0 Safari', 'Chrome/130 Safari'));
    (window as RuntimeWindow).webkit = { messageHandlers: {} };
    document.documentElement.classList.add('ios');

    expect(extensionTip(renderTips())).toBeUndefined();
  });
});
