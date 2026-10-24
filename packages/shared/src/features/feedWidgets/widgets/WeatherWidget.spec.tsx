import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeatherWidget } from './WeatherWidget';
import type { FeedWidgetConfig } from '../types';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { defaultWeatherUnit } from '../weather';

const forecast = {
  current: {
    time: '2026-10-22T14:00',
    temperature_2m: 20,
    weather_code: 0,
    is_day: 1,
  },
  hourly: {
    time: ['2026-10-22T14:00', '2026-10-22T15:00', '2026-10-22T16:00'],
    temperature_2m: [20, 21, 10],
    weather_code: [0, 2, 61],
    is_day: [1, 1, 1],
  },
  daily: {
    time: ['2026-10-22', '2026-10-23'],
    weather_code: [0, 95],
    temperature_2m_max: [22, 18],
    temperature_2m_min: [9, 7],
  },
};

const places = {
  results: [
    {
      id: 1,
      name: 'Amsterdam',
      latitude: 52.37403,
      longitude: 4.88969,
      country: 'Netherlands',
      admin1: 'North Holland',
    },
  ],
};

const fetchMock = jest.fn();
const onConfigChange = jest.fn(() => true);

const respond = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockImplementation((url: string) =>
    respond(url.includes('geocoding') ? places : forecast),
  );
  global.fetch = fetchMock as unknown as typeof fetch;
});

const renderWidget = (
  config?: FeedWidgetConfig<FeedWidgetKind.Weather>,
  size = FeedWidgetSize.Tall,
) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <WeatherWidget
        widget={{ id: 'w1', kind: FeedWidgetKind.Weather, size, config }}
        size={size}
        isEditing={false}
        onConfigChange={onConfigChange}
        canConfigure
        isConfiguring={false}
        onConfigureEnd={() => undefined}
      />
    </QueryClientProvider>,
  );

const amsterdam = {
  location: 'Amsterdam',
  latitude: 52.37,
  longitude: 4.89,
};

describe('WeatherWidget', () => {
  it('asks for a place before fetching anything', async () => {
    renderWidget();

    fireEvent.click(screen.getByRole('button', { name: 'Set location' }));
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Amster' },
    });
    fireEvent.click(await screen.findByRole('button', { name: /Amsterdam/ }));

    expect(onConfigChange).toHaveBeenCalledWith({
      location: 'Amsterdam',
      latitude: 52.37403,
      longitude: 4.88969,
      unit: expect.any(String),
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('geocoding');
  });

  it('only asks the browser for a location when the reader does', async () => {
    const getCurrentPosition = jest.fn((success: PositionCallback) =>
      success({
        coords: { latitude: 52.123456, longitude: 4.987654 },
      } as GeolocationPosition),
    );
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition },
      configurable: true,
    });
    renderWidget();
    expect(getCurrentPosition).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Set location' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use my location' }));

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'Your location',
        latitude: 52.12,
        longitude: 4.99,
      }),
    );
  });

  it('stops waiting when a dismissed prompt never answers', async () => {
    jest.useFakeTimers();
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: jest.fn() },
      configurable: true,
    });
    renderWidget();

    fireEvent.click(screen.getByRole('button', { name: 'Set location' }));
    const locate = screen.getByRole('button', { name: 'Use my location' });
    fireEvent.click(locate);
    expect(locate).toHaveAttribute('aria-busy', 'true');

    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(
      screen.getByRole('button', { name: 'Use my location' }),
    ).not.toHaveAttribute('aria-busy', 'true');
    jest.useRealTimers();
  });

  it('shows the sky now and the next hours in the picked unit', async () => {
    renderWidget({ ...amsterdam, unit: 'f' });

    expect(await screen.findByText('68°')).toBeInTheDocument();
    expect(screen.getByText('Sunny')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Weather by Open-Meteo' }),
    ).toHaveAttribute('href', 'https://open-meteo.com/');
    expect(screen.getByText('H 72° · L 48°')).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: 'Next hours' }).children,
    ).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toContain('latitude=52.37');
  });

  it('keeps Small to the sky now', async () => {
    renderWidget({ ...amsterdam, unit: 'c' }, FeedWidgetSize.Small);

    expect(await screen.findByText('20°')).toBeInTheDocument();
    expect(
      screen.queryByRole('list', { name: 'Next hours' }),
    ).not.toBeInTheDocument();
  });

  it('adds the coming days at Large', async () => {
    renderWidget({ ...amsterdam, unit: 'c' }, FeedWidgetSize.Large);

    expect(
      await screen.findByLabelText('Today: Sunny, high 22°, low 9°'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: 'Next days' }).children,
    ).toHaveLength(2);
  });

  it('says so when the forecast does not load', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    renderWidget({ ...amsterdam, unit: 'c' });

    await waitFor(() =>
      expect(
        screen.getByText('Couldn’t load the forecast. Try again later.'),
      ).toBeInTheDocument(),
    );
  });
});

describe('defaultWeatherUnit', () => {
  it('reads Fahrenheit regions from the locale', () => {
    expect(defaultWeatherUnit('en-US')).toBe('f');
    expect(defaultWeatherUnit('en-GB')).toBe('c');
    expect(defaultWeatherUnit('nl')).toBe('c');
  });
});
