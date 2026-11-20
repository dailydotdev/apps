import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import ad from '../../../../../__tests__/fixture/ad';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { AdViewability } from './AdViewability';
import { AdPixel } from './AdPixel';
import { AdSlot } from './AdSlot';
import { getLogContextStatic } from '../../../../contexts/LogContext';
import type { Ad } from '../../../../graphql/posts';

const lifecycleFlags = () =>
  new GrowthBook({ features: { ad_slot_lifecycle: { defaultValue: true } } });

const ownPixel = 'https://api.daily.dev/a/imp';
const thirdPartyPixel = 'https://ads.example.com/imp';

let observerCallback: IntersectionObserverCallback;
const originalIntersectionObserver = global.IntersectionObserver;

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

const renderComponent = (
  pixel?: string[],
  lifecycle?: Ad['lifecycle'],
): void => {
  render(
    <TestBootProvider client={new QueryClient()} gb={lifecycleFlags()}>
      <AdViewability ad={{ ...ad, pixel, lifecycle }} onViewable={jest.fn()} />
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
  global.IntersectionObserver = originalIntersectionObserver;
});

it('should re-fire our own pixel as viewed once the ad is viewable', () => {
  renderComponent([ownPixel]);

  expect(getPixelSources()).toHaveLength(0);

  becomeViewable();

  expect(getPixelSources()).toEqual([`${ownPixel}?viewed=true`]);
});

it.each<{ name: string; lifecycle?: Ad['lifecycle'] }>([
  { name: 'legacy response' },
  {
    name: 'default lifecycle',
    lifecycle: {
      version: 1,
      on: {
        impression: [
          { type: 'pixel', url: thirdPartyPixel },
          { type: 'pixel', url: ownPixel },
        ],
      },
    },
  },
])(
  'only re-fires first-party pixels at viewability with a $name',
  ({ lifecycle }) => {
    renderComponent([thirdPartyPixel, ownPixel], lifecycle);

    becomeViewable();

    expect(getPixelSources()).toEqual([`${ownPixel}?viewed=true`]);
  },
);

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

it('keeps the legacy viewed pixel and measurement when lifecycle is disabled for a cached ad', () => {
  const gb = lifecycleFlags();
  const client = new QueryClient();
  const onViewable = jest.fn();
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const creative: Ad = {
    ...ad,
    generationId: 'viewability-kill-switch',
    pixel: [ownPixel],
    lifecycle: {
      version: 1,
      on: { visible: [{ type: 'pixel', url: thirdPartyPixel }] },
    },
  };
  const show = () => (
    <TestBootProvider client={client} gb={gb}>
      <AdViewability ad={creative} onViewable={onViewable} />
    </TestBootProvider>
  );
  const { rerender } = render(show());
  becomeViewable();
  const tracker = screen.getByTestId('adViewability');
  const pixel = screen.getByTestId('pixel');
  expect(onViewable).toHaveBeenCalledTimes(1);
  expect(src.mock.calls).toEqual([
    [thirdPartyPixel],
    [`${ownPixel}?viewed=true`],
  ]);

  act(() => gb.setFeatures({ ad_slot_lifecycle: { defaultValue: false } }));
  rerender(show());
  becomeViewable();
  expect(screen.getByTestId('adViewability')).toBe(tracker);
  expect(screen.getByTestId('pixel')).toBe(pixel);
  expect(onViewable).toHaveBeenCalledTimes(1);
  expect(src).toHaveBeenCalledTimes(2);
});

it('runs configured actions in order and once per creative generation', () => {
  const configured: Ad = {
    ...ad,
    generationId: 'generation-1',
    pixel: [ownPixel],
    lifecycle: {
      version: 1,
      on: {
        impression: [],
        'pre-render': [{ type: 'event', name: 'refresh' }],
        'post-render': [{ type: 'event', name: 'impression' }],
        visible: [{ type: 'pixel', url: thirdPartyPixel }],
        'half-visible': [{ type: 'event', name: 'click' }],
        'visible-for-1s': [{ type: 'event', name: 'refresh stop' }],
        viewable: [{ type: 'event', name: 'viewable impression' }],
      },
    },
  };
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const logEvent = jest.fn((event: { event_name: string }) => {
    expect(event.event_name).toBeTruthy();
    expect(screen.getByTestId('creative')).toBeInTheDocument();
  });
  const onViewable = jest.fn();
  const LogContext = getLogContextStatic();
  const showAd = (creative: Ad) => (
    <TestBootProvider client={new QueryClient()} gb={lifecycleFlags()}>
      <LogContext.Provider
        value={{
          logEvent,
          logEventStart: jest.fn(),
          logEventEnd: jest.fn(),
          sendBeacon: jest.fn(),
        }}
      >
        <AdSlot ad={creative}>
          {(slotProps) => (
            <div {...slotProps} data-testid="creative">
              <AdPixel ad={creative} />
              <AdViewability ad={creative} onViewable={onViewable} />
            </div>
          )}
        </AdSlot>
      </LogContext.Provider>
    </TestBootProvider>
  );
  const loggedNames = () =>
    logEvent.mock.calls.map(([event]) => event.event_name);
  const { unmount, container } = render(showAd(configured));
  expect(container.firstElementChild).toBe(screen.getByTestId('creative'));
  expect(loggedNames()).toEqual(['refresh', 'impression']);
  expect(getPixelSources()).toHaveLength(0);

  intersect(0.25);
  act(() => jest.advanceTimersByTime(900));
  intersect(0);
  act(() => jest.advanceTimersByTime(100));
  expect(loggedNames()).toEqual(['refresh', 'impression']);
  expect(src).toHaveBeenCalledTimes(1);
  expect(src).toHaveBeenCalledWith(thirdPartyPixel);

  intersect(0.25);
  act(() => jest.advanceTimersByTime(1_000));
  expect(loggedNames()).toEqual(['refresh', 'impression', 'refresh stop']);
  expect(onViewable).not.toHaveBeenCalled();

  intersect(0.5);
  expect(loggedNames()).toEqual([
    'refresh',
    'impression',
    'refresh stop',
    'click',
  ]);
  act(() => jest.advanceTimersByTime(1_000));
  expect(onViewable).toHaveBeenCalledTimes(1);

  unmount();
  const { rerender } = render(
    showAd(JSON.parse(JSON.stringify(configured)) as Ad),
  );
  becomeViewable();
  expect(src).toHaveBeenCalledTimes(1);
  expect(onViewable).toHaveBeenCalledTimes(1);

  rerender(showAd({ ...configured, generationId: 'generation-2' }));
  becomeViewable();
  expect(src).toHaveBeenCalledTimes(2);
  expect(onViewable).toHaveBeenCalledTimes(2);
});

it('fires each configured click without changing impression tracking or unrelated links', () => {
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const creative: Ad = {
    ...ad,
    link: 'https://advertiser.example',
    lifecycle: {
      version: 1,
      on: { click: [{ type: 'pixel', url: 'https://tracker.example/click' }] },
    },
  };
  render(
    <TestBootProvider client={new QueryClient()} gb={lifecycleFlags()}>
      <AdSlot ad={creative}>
        {(slotProps) => (
          <div {...slotProps}>
            <a href={creative.link}>Advertiser</a>
            <a href="https://daily.dev/advertise">Advertise</a>
          </div>
        )}
      </AdSlot>
    </TestBootProvider>,
  );
  fireEvent.click(screen.getByRole('link', { name: 'Advertise' }));
  expect(src).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('link', { name: 'Advertiser' }));
  fireEvent.click(screen.getByRole('link', { name: 'Advertiser' }));
  expect(src).toHaveBeenCalledTimes(2);
});
