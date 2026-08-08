import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ad from '../../../../../__tests__/fixture/ad';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { AdViewability } from './AdViewability';

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

const becomeViewable = (): void => {
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
    jest.advanceTimersByTime(1_000);
  });
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
