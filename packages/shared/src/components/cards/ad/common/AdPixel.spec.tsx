import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import ad from '../../../../../__tests__/fixture/ad';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { getLogContextStatic } from '../../../../contexts/LogContext';
import type { Ad } from '../../../../graphql/posts';
import { AdPixel } from './AdPixel';

jest.mock('../../../../lib/constants', () => ({
  ...jest.requireActual('../../../../lib/constants'),
  isTesting: false,
}));

const url = '/impression?cb=[timestamp]';
const configuredAd: Ad = {
  ...ad,
  pixel: [url],
  lifecycle: {
    version: 1,
    on: {
      impression: [
        { type: 'pixel', url },
        { type: 'event', name: 'impression' },
      ],
    },
  },
};

const renderTracker = (creative: Ad, logEvent = jest.fn()) => {
  const LogContext = getLogContextStatic();
  return render(
    <TestBootProvider
      client={new QueryClient()}
      gb={
        new GrowthBook({
          features: { ad_slot_lifecycle: { defaultValue: true } },
        })
      }
    >
      <LogContext.Provider
        value={{
          logEvent,
          logEventStart: jest.fn(),
          logEventEnd: jest.fn(),
          sendBeacon: jest.fn(),
        }}
      >
        <AdPixel ad={creative} />
      </LogContext.Provider>
    </TestBootProvider>,
  );
};

afterEach(() => jest.restoreAllMocks());

it('runs impression actions when the original marker intersects without tab focus', () => {
  jest.spyOn(document, 'hasFocus').mockReturnValue(false);
  const logEvent = jest.fn();
  renderTracker(configuredAd, logEvent);
  expect(screen.queryByTestId('pixel')).not.toBeInTheDocument();
  expect(logEvent).not.toHaveBeenCalled();

  mockAllIsIntersecting(true);

  expect(screen.getByTestId('pixel')).toHaveAttribute(
    'src',
    expect.stringMatching(/^\/impression\?cb=\d+$/),
  );
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_name: 'impression' }),
  );
});

it('still fires the impression pixel when IntersectionObserver is unavailable', () => {
  const observer = globalThis.IntersectionObserver;
  Reflect.set(globalThis, 'IntersectionObserver', undefined);

  try {
    renderTracker(configuredAd);
    expect(screen.getByTestId('pixel')).toBeInTheDocument();
  } finally {
    globalThis.IntersectionObserver = observer;
  }
});

it('preserves an existing impression image when lifecycle is switched off for a cached creative', () => {
  const gb = new GrowthBook({
    features: { ad_slot_lifecycle: { defaultValue: true } },
  });
  const client = new QueryClient();
  const show = () => (
    <TestBootProvider client={client} gb={gb}>
      <AdPixel
        ad={{ ...configuredAd, generationId: 'cached-pixel-kill-switch' }}
      />
    </TestBootProvider>
  );
  const { rerender } = render(show());
  mockAllIsIntersecting(true);
  const pixel = screen.getByTestId('pixel');
  const source = pixel.getAttribute('src');

  act(() => gb.setFeatures({ ad_slot_lifecycle: { defaultValue: false } }));
  rerender(show());

  expect(screen.getByTestId('pixel')).toBe(pixel);
  expect(pixel).toHaveAttribute('src', source);
});
