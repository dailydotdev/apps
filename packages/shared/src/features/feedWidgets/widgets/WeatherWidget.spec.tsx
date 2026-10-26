import React from 'react';
import nock from 'nock';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { get as getCache, set as setCache } from 'idb-keyval';
import ad from '../../../../__tests__/fixture/ad';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import type { SettingsFlags } from '../../../graphql/settings';
import FeedContext from '../../../contexts/FeedContext';
import { FeedWidgetRail } from '../FeedWidgetRail';
import { useFeedWidgetAd } from '../feedState';
import { PersistentContextKeys } from '../../../hooks/usePersistentContext';
import type { FeedWidgetConfig } from '../types';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { WeatherWidget } from './WeatherWidget';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

let mockIsExtension = false;

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  get isExtension() {
    return mockIsExtension;
  },
}));

jest.mock('../feedState', () => ({
  ...jest.requireActual('../feedState'),
  useFeedWidgetAd: jest.fn(),
}));

// jsdom has no PointerEvent, and without one fireEvent drops the button and
// the pointer type Radix and the trigger read.
class TestPointerEvent extends MouseEvent {
  pointerType: string;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
  }
}
Object.assign(window, { PointerEvent: TestPointerEvent });

// jsdom lays nothing out, so it has no element scrolling.
Element.prototype.scrollTo = jest.fn();

type WeatherConfig = FeedWidgetConfig<FeedWidgetKind.Weather>;

const TEL_AVIV = 'Tel Aviv@32.08,34.78';

const forecastBody = ({
  temp = 31,
  precipitation = 0,
  quarters = [0, 0, 0, 0],
} = {}) => ({
  current: {
    temperature_2m: temp,
    apparent_temperature: temp + 1,
    relative_humidity_2m: 54,
    wind_speed_10m: 15,
    precipitation,
    weather_code: precipitation ? 61 : 0,
    is_day: 1,
  },
  minutely_15: { precipitation: quarters },
  hourly: {
    time: [13, 14, 15, 16, 17, 18].map(
      (hour) => `2026-10-26T${String(hour).padStart(2, '0')}:00`,
    ),
    temperature_2m: [27, 28, 28, 27, 25, 24],
    weather_code: [0, 0, 1, 2, 2, 0],
    is_day: [1, 1, 1, 1, 1, 0],
  },
  daily: {
    time: [26, 27, 28, 29, 30, 31].map((day) => `2026-10-${day}`),
    weather_code: [0, 0, 2, 3, 61, 2],
    temperature_2m_max: [29, 30, 28, 26, 23, 25],
    temperature_2m_min: [21, 22, 21, 20, 18, 19],
    precipitation_probability_max: [0, 0, 10, 20, 70, 0],
    uv_index_max: [7, 7, 5, 3, 2, 4],
  },
});

const mockForecast = (
  body: object = forecastBody(),
  unit: 'celsius' | 'fahrenheit' = 'celsius',
  status = 200,
) =>
  nock('https://api.open-meteo.com')
    .get('/v1/forecast')
    .query(
      (query) =>
        query.latitude === '32.08' &&
        query.longitude === '34.78' &&
        query.temperature_unit === unit,
    )
    .reply(status, body);

const mockPlaces = (name: string) =>
  nock('https://geocoding-api.open-meteo.com')
    .get('/v1/search')
    .query((query) => query.name === name)
    .reply(200, {
      results: [
        {
          id: 1,
          name: 'Tel Aviv',
          latitude: 32.08088,
          longitude: 34.78057,
          admin1: 'Tel Aviv',
          country: 'Israel',
        },
      ],
    });

const findTemperature = async (temp: string) =>
  (await screen.findAllByText(temp))[0];

const onConfigChange = jest.fn(() => true);
const onConfigureEnd = jest.fn();

const renderWidget = ({
  config,
  size = FeedWidgetSize.Tall,
  isConfiguring = false,
  canConfigure = true,
}: {
  config?: WeatherConfig;
  size?: FeedWidgetSize;
  isConfiguring?: boolean;
  canConfigure?: boolean;
} = {}) =>
  render(
    <TestBootProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <WeatherWidget
        widget={{
          id: 'weather',
          kind: FeedWidgetKind.Weather,
          size,
          ...(config && { config }),
        }}
        size={size}
        isEditing={false}
        onConfigChange={onConfigChange}
        canConfigure={canConfigure}
        isConfiguring={isConfiguring}
        onConfigureEnd={onConfigureEnd}
      />
    </TestBootProvider>,
  );

const mockGeolocation = (
  respond: (success: PositionCallback, failure: PositionErrorCallback) => void,
) =>
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: jest.fn(respond),
    },
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockIsExtension = false;
  nock.cleanAll();
  mockGeolocation(jest.fn());
  mockDesktop();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
  jest
    .mocked(useFeedWidgetAd)
    .mockReturnValue({ ad, isEnabled: true, isNoFill: false });
});

describe('WeatherWidget', () => {
  it('asks for a place before it has one', async () => {
    renderWidget();

    expect(
      await screen.findByText('The weather where you code.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Use my location' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Choose a city' }));

    expect(
      await screen.findByRole('textbox', { name: 'Search for a city' }),
    ).toBeInTheDocument();
  });

  it('shows the forecast for the saved city', async () => {
    mockForecast();
    renderWidget({ config: { location: TEL_AVIV, unit: 'c' } });

    expect(await findTemperature('31°')).toBeInTheDocument();
    expect(screen.getByText('Tel Aviv')).toBeInTheDocument();
    expect(screen.getByText('Clear · H 29° L 21°')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Next hours' })).toHaveTextContent(
      /^31°28°/,
    );
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    );
    expect(
      screen.getByRole('list', { name: 'Next days' }).children,
    ).toHaveLength(5);
  });

  it('closes Small on the next four hours, or on rain within the hour', async () => {
    mockForecast();
    const { unmount } = renderWidget({
      config: { location: TEL_AVIV, unit: 'c' },
      size: FeedWidgetSize.Small,
    });

    const hours = await screen.findByRole('list', { name: 'Next hours' });
    expect(hours.children).toHaveLength(4);
    unmount();

    mockForecast(
      forecastBody({ precipitation: 0.6, quarters: [0.6, 0.3, 0, 0] }),
    );
    renderWidget({
      config: { location: TEL_AVIV, unit: 'c' },
      size: FeedWidgetSize.Small,
    });

    expect(
      await screen.findByText('Rain stopping in 30 min'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('list', { name: 'Next hours' }),
    ).not.toBeInTheDocument();
  });

  it('adds the details and every day at Large', async () => {
    mockForecast();
    renderWidget({
      config: { location: TEL_AVIV, unit: 'c' },
      size: FeedWidgetSize.Large,
    });

    expect(await screen.findByText('Feels like')).toBeInTheDocument();
    expect(screen.getByText('15 km/h')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText(/Rain likely Fri\./)).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: 'Next days' }).children,
    ).toHaveLength(6);
  });

  it('follows the saved unit, else the locale', async () => {
    mockForecast(forecastBody({ temp: 81 }), 'fahrenheit');
    const { unmount } = renderWidget({ config: { location: TEL_AVIV } });

    // jsdom reads as en-US.
    expect(await findTemperature('81°')).toBeInTheDocument();
    unmount();

    const language = jest
      .spyOn(navigator, 'language', 'get')
      .mockReturnValue('en-GB');
    mockForecast(forecastBody({ temp: 31 }), 'celsius');
    const { unmount: unmountBritish } = renderWidget({
      config: { location: TEL_AVIV },
    });

    expect(await findTemperature('31°')).toBeInTheDocument();
    unmountBritish();

    mockForecast(forecastBody({ temp: 88 }), 'fahrenheit');
    renderWidget({ config: { location: TEL_AVIV, unit: 'f' } });

    expect(await findTemperature('88°')).toBeInTheDocument();
    language.mockRestore();
  });

  it('switches the unit while changing the location', async () => {
    renderWidget({ config: { location: TEL_AVIV }, isConfiguring: true });

    const celsius = await screen.findByRole('button', { name: '°C' });
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(celsius);

    expect(onConfigChange).toHaveBeenCalledWith({
      location: TEL_AVIV,
      unit: 'c',
    });
  });

  it('offers a retry when the forecast fails', async () => {
    mockForecast({}, 'celsius', 500);
    renderWidget({ config: { location: TEL_AVIV, unit: 'c' } });

    expect(
      await screen.findByText('Couldn’t load the weather.'),
    ).toBeInTheDocument();
    mockForecast();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await findTemperature('31°')).toBeInTheDocument();
  });

  it('saves a city picked from the search', async () => {
    mockPlaces('Tel');
    renderWidget();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Choose a city' }),
    );
    fireEvent.input(
      screen.getByRole('textbox', { name: 'Search for a city' }),
      {
        target: { value: 'Tel' },
      },
    );
    fireEvent.click(await screen.findByRole('button', { name: /Tel Aviv/ }));

    expect(onConfigChange).toHaveBeenCalledWith({ location: TEL_AVIV });
    expect(onConfigureEnd).toHaveBeenCalled();
  });

  it('keeps this device’s location on the device, not in the synced config', async () => {
    mockGeolocation((success) =>
      success({
        coords: { latitude: 32.0809, longitude: 34.7806 },
      } as GeolocationPosition),
    );
    renderWidget({
      config: { location: TEL_AVIV, unit: 'c' },
      isConfiguring: true,
    });

    fireEvent.click(
      await screen.findByRole('button', { name: 'Use my location' }),
    );

    // The city is cleared from the synced config; the unit stays.
    await waitFor(() =>
      expect(onConfigChange).toHaveBeenCalledWith({ unit: 'c' }),
    );
    expect(onConfigureEnd).toHaveBeenCalled();
    expect(await getCache(PersistentContextKeys.WeatherDeviceLocation)).toEqual(
      { latitude: 32.08, longitude: 34.78 },
    );
  });

  it('shows the forecast for the location kept on this device', async () => {
    await setCache(PersistentContextKeys.WeatherDeviceLocation, {
      latitude: 32.08,
      longitude: 34.78,
    });
    mockForecast();
    renderWidget({ config: { unit: 'c' } });

    expect(await findTemperature('31°')).toBeInTheDocument();
    expect(screen.getByText('Current location')).toBeInTheDocument();
  });

  it('falls back to the city search when location access is blocked', async () => {
    mockGeolocation((_, failure) =>
      failure({
        code: 1,
        PERMISSION_DENIED: 1,
      } as GeolocationPositionError),
    );
    renderWidget();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Use my location' }),
    );

    expect(
      await screen.findByText(
        'Location access is blocked, so search for your city instead.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Search for a city' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use my location' }),
    ).not.toBeInTheDocument();
  });

  it('falls back to the city search when the location never comes', async () => {
    jest.useFakeTimers();
    renderWidget();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Use my location' }),
    );
    act(() => {
      jest.advanceTimersByTime(20 * 1000);
    });

    expect(
      screen.getByText(
        'Couldn’t find your location. Search for your city instead.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Search for a city' }),
    ).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('asks only for a city in the extension, which has no location access', async () => {
    mockIsExtension = true;
    renderWidget();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Choose a city' }),
    );

    expect(
      await screen.findByRole('textbox', { name: 'Search for a city' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use my location' }),
    ).not.toBeInTheDocument();
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });

  it('looks up a city saved by name alone', async () => {
    mockPlaces('Tel Aviv');
    mockForecast();
    renderWidget({ config: { location: 'Tel Aviv', unit: 'c' } });

    expect(await findTemperature('31°')).toBeInTheDocument();
    expect(screen.getByText('Tel Aviv')).toBeInTheDocument();
  });

  it('offers no picker it could not save from', async () => {
    renderWidget({ canConfigure: false });

    expect(
      await screen.findByText(
        'This widget was set up in a newer version of daily.dev.',
      ),
    ).toBeInTheDocument();
  });
});

describe('WeatherWidget on the rail', () => {
  const setSettings = jest.fn();

  it('changes the location from the widget menu', async () => {
    mockForecast();
    render(
      <TestBootProvider
        client={new QueryClient()}
        settings={{
          flags: {
            feedWidgets: {
              version: 1,
              widgets: [
                {
                  id: 'weather',
                  kind: FeedWidgetKind.Weather,
                  size: FeedWidgetSize.Tall,
                  config: { location: TEL_AVIV, unit: 'c' },
                },
              ],
            },
          } as unknown as SettingsFlags,
          setSettings,
        }}
      >
        <FeedContext.Provider
          value={{ pageSize: 13, numCards: { eco: 4, roomy: 4, cozy: 4 } }}
        >
          <FeedWidgetRail feedName="popular" onHide={jest.fn()} />
        </FeedContext.Provider>
      </TestBootProvider>,
    );
    await waitFor(() =>
      expect(screen.getAllByTestId('feedWidget').length).toBeGreaterThan(0),
    );
    act(() => mockAllIsIntersecting(true));
    expect(await findTemperature('31°')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Weather options' }), {
      key: 'Enter',
    });
    const [change] = screen
      .getAllByRole('menuitem', { name: 'Change location' })
      .filter((item) => item.tagName === 'BUTTON');
    fireEvent.click(change);

    expect(
      await screen.findByRole('textbox', { name: 'Search for a city' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await findTemperature('31°')).toBeInTheDocument();
    expect(setSettings).not.toHaveBeenCalled();
  });
});
