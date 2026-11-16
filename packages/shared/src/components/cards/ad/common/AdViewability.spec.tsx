import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ad from '../../../../../__tests__/fixture/ad';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { AdViewability } from './AdViewability';
import { AdPixel } from './AdPixel';
import { AdSlot } from './AdSlot';
import { getLogContextStatic } from '../../../../contexts/LogContext';
import type { Ad } from '../../../../graphql/posts';

const ownPixel = 'https://api.daily.dev/a/imp';
const thirdPartyPixel = 'https://ads.example.com/imp';

let observerCallback: IntersectionObserverCallback;

const mockObserver = (): void => {
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    observerCallback = callback;

    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
  }) as unknown as typeof IntersectionObserver;
};

const intersect = (ratio: number): void => {
  act(() => {
    observerCallback(
      [
        {
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
          boundingClientRect: { width: 300, height: 250 } as DOMRectReadOnly,
        } as IntersectionObserverEntry,
      ],
      null as unknown as IntersectionObserver,
    );
  });
};

const becomeViewable = (): void => {
  intersect(0.5);
  act(() => jest.advanceTimersByTime(1_000));
};

const renderComponent = (pixel?: string[]): void => {
  render(
    <TestBootProvider client={new QueryClient()}>
      <AdViewability ad={{ ...ad, pixel }} onViewable={jest.fn()} />
    </TestBootProvider>,
  );
};

const getPixelSources = (): string[] =>
  screen.queryAllByTestId('pixel').map((el) => el.getAttribute('src') ?? '');

beforeEach(() => {
  jest.useFakeTimers();
  mockObserver();
  jest.spyOn(document, 'hasFocus').mockReturnValue(true);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('should re-fire our own pixel as viewed once the ad is viewable', () => {
  renderComponent([ownPixel]);

  expect(getPixelSources()).toHaveLength(0);

  becomeViewable();

  expect(getPixelSources()).toEqual([`${ownPixel}?viewed=true`]);
});

it('should not re-fire third party pixels', () => {
  renderComponent([thirdPartyPixel, ownPixel]);

  becomeViewable();

  expect(getPixelSources()).toEqual([`${ownPixel}?viewed=true`]);
});

it('should not fire anything before the ad is viewable', () => {
  renderComponent([ownPixel]);

  act(() => {
    observerCallback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 0.5,
          boundingClientRect: { width: 300, height: 250 } as DOMRectReadOnly,
        } as IntersectionObserverEntry,
      ],
      null as unknown as IntersectionObserver,
    );
  });

  act(() => {
    jest.advanceTimersByTime(900);
  });

  expect(getPixelSources()).toHaveLength(0);
});

it('runs configured actions in order and once per creative generation', () => {
  const configured: Ad = {
    ...ad,
    generationId: 'generation-1',
    pixel: [ownPixel],
    lifecycle: {
      version: 1,
      on: {
        'pre-render': [{ type: 'event', name: 'before' }],
        'post-render': [{ type: 'event', name: 'after' }],
        visible: [{ type: 'pixel', url: thirdPartyPixel }],
        'half-visible': [{ type: 'event', name: 'half' }],
        'visible-for-1s': [{ type: 'event', name: 'one second' }],
        viewable: [{ type: 'event', name: 'viewable impression' }],
      },
    },
  };
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const logEvent = jest.fn(({ event_name }) => {
    if (event_name === 'before') {
      expect(screen.queryByTestId('creative')).not.toBeInTheDocument();
    } else {
      expect(screen.getByTestId('creative')).toBeInTheDocument();
    }
  });
  const onViewable = jest.fn();
  const LogContext = getLogContextStatic();
  const showAd = (creative: Ad) => (
    <TestBootProvider client={new QueryClient()}>
      <LogContext.Provider
        value={{
          logEvent,
          logEventStart: jest.fn(),
          logEventEnd: jest.fn(),
          sendBeacon: jest.fn(),
        }}
      >
        <AdSlot ad={creative}>
          <div data-testid="creative">
            <AdPixel ad={creative} />
            <AdViewability ad={creative} onViewable={onViewable} />
          </div>
        </AdSlot>
      </LogContext.Provider>
    </TestBootProvider>
  );
  const loggedNames = () =>
    logEvent.mock.calls.map(([event]) => event.event_name);
  const { unmount } = render(showAd(configured));
  expect(loggedNames()).toEqual(['before', 'after']);
  expect(getPixelSources()).toHaveLength(0);

  intersect(0.25);
  act(() => jest.advanceTimersByTime(900));
  intersect(0);
  act(() => jest.advanceTimersByTime(100));
  expect(loggedNames()).toEqual(['before', 'after']);
  expect(src).toHaveBeenCalledTimes(1);
  expect(src).toHaveBeenCalledWith(thirdPartyPixel);

  intersect(0.25);
  act(() => jest.advanceTimersByTime(1_000));
  expect(loggedNames()).toEqual(['before', 'after', 'one second']);
  expect(onViewable).not.toHaveBeenCalled();

  intersect(0.5);
  expect(loggedNames()).toEqual(['before', 'after', 'one second', 'half']);
  act(() => jest.advanceTimersByTime(1_000));
  expect(onViewable).toHaveBeenCalledTimes(1);

  unmount();
  const { rerender } = render(showAd({ ...configured }));
  becomeViewable();
  expect(src).toHaveBeenCalledTimes(1);
  expect(onViewable).toHaveBeenCalledTimes(1);

  rerender(showAd({ ...configured, generationId: 'generation-2' }));
  becomeViewable();
  expect(src).toHaveBeenCalledTimes(2);
  expect(onViewable).toHaveBeenCalledTimes(2);
});
