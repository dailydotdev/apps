import React, { ReactElement, ReactNode, useContext, useEffect } from 'react';
import nock from 'nock';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import AnalyticsContext, { AnalyticsContextProvider } from './AnalyticsContext';
import { AnalyticsContextData } from '../hooks/analytics/useAnalyticsContextData';
import FeaturesContext, { FeaturesData } from './FeaturesContext';
import SettingsContext, { SettingsContextData } from './SettingsContext';
import AuthContext, { AuthContextData } from './AuthContext';
import { AnonymousUser } from '../lib/user';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';
import { Visit } from '../lib/boot';
import { waitForNock } from '../../__tests__/helpers/utilities';

let queryClient: QueryClient;
const getPage = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  queryClient = new QueryClient();
});

const features: FeaturesData = {
  flags: {
    login: {
      enabled: true,
      value: 'primary',
    },
    theme: {
      enabled: true,
      value: 'dark',
    },
  },
};

const settings: SettingsContextData = {
  spaciness: 'roomy',
  loadedSettings: true,
  setTheme: jest.fn(),
  themeMode: 'light',
  insaneMode: true,
  showTopSites: true,
  toggleInsaneMode: jest.fn(),
  openNewTab: true,
  setSpaciness: jest.fn(),
  toggleOpenNewTab: jest.fn(),
  toggleShowOnlyUnreadPosts: jest.fn(),
  toggleShowTopSites: jest.fn(),
  showOnlyUnreadPosts: false,
};

const AnalyticsContextTester = ({
  callback,
}: {
  callback: (contextData: AnalyticsContextData) => unknown;
}): ReactElement => {
  const contextData = useContext(AnalyticsContext);

  useEffect(() => {
    callback(contextData);
  }, []);

  return <></>;
};

const TestComponent = ({
  children,
  authContext,
}: {
  children: ReactNode;
  authContext: Pick<
    AuthContextData,
    'user' | 'anonymous' | 'tokenRefreshed' | 'visit'
  >;
}): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <FeaturesContext.Provider value={features}>
      <AuthContext.Provider
        value={{
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
          trackingId: authContext.user?.id || authContext.anonymous?.id,
          ...authContext,
        }}
      >
        <SettingsContext.Provider value={settings}>
          <AnalyticsContextProvider app="test" getPage={getPage} deviceId="123">
            {children}
          </AnalyticsContextProvider>
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </FeaturesContext.Provider>
  </QueryClientProvider>
);

const baseAnonymous: AnonymousUser = {
  id: 'u',
  referrer: 'ido',
  firstVisit: new Date(Date.UTC(2021, 7, 28)).toISOString(),
};

const baseVisit: Visit = {
  visitId: 'v',
  sessionId: 's',
};

const mockEventsEndpoint = (takeSnapshot = true) => {
  nock('http://localhost:3000')
    .post('/e', (body: { events: AnalyticsEvent[] }) => {
      if (takeSnapshot) {
        // Reset time based properties
        expect(
          body.events.map((event) => {
            expect(event.event_id).toBeDefined();
            expect(event.event_timestamp).toBeDefined();
            expect(event.device_id).toBeDefined();
            return {
              ...event,
              event_id: '',
              event_timestamp: '',
              device_id: '',
            };
          }),
        ).toMatchSnapshot();
      }
      return true;
    })
    .reply(200, 'OK');
};

it('should batch events before sending', async () => {
  mockEventsEndpoint();
  const callback = ({ trackEvent }: AnalyticsContextData) => {
    trackEvent({ event_name: 'e1' });
    trackEvent({ event_name: 'e2' });
  };

  render(
    <TestComponent
      authContext={{
        anonymous: baseAnonymous,
        tokenRefreshed: true,
        visit: baseVisit,
      }}
    >
      <AnalyticsContextTester callback={callback} />
    </TestComponent>,
  );
  await waitForNock();
});

it('should add relevant properties when user is signed-in', async () => {
  mockEventsEndpoint();
  const callback = ({ trackEvent }: AnalyticsContextData) => {
    trackEvent({ event_name: 'e1' });
  };
  render(
    <TestComponent
      authContext={{
        anonymous: baseAnonymous,
        visit: baseVisit,
        user: {
          id: 'u',
          createdAt: new Date(Date.UTC(2021, 7, 29)).toISOString(),
          email: 'u@a.com',
          image: 'https://image.com',
          name: 'U',
          providers: ['github'],
        },
        tokenRefreshed: true,
      }}
    >
      <AnalyticsContextTester callback={callback} />
    </TestComponent>,
  );
  await waitForNock();
});

it('should send events in different batches', async () => {
  let done = false;
  const callback = async ({ trackEvent }: AnalyticsContextData) => {
    mockEventsEndpoint();
    trackEvent({ event_name: 'e1' });
    await new Promise((resolve) => setTimeout(resolve, 600));
    mockEventsEndpoint();
    trackEvent({ event_name: 'e2' });
    done = true;
  };

  render(
    <TestComponent
      authContext={{
        anonymous: baseAnonymous,
        tokenRefreshed: true,
        visit: baseVisit,
      }}
    >
      <AnalyticsContextTester callback={callback} />
    </TestComponent>,
  );
  await waitFor(() => expect(done).toBeTruthy());
  await waitForNock();
});

it('should send event with duration', async () => {
  nock('http://localhost:3000')
    .post('/e', (body: { events: AnalyticsEvent[] }) => {
      expect(body.events[0].event_duration).toBeTruthy();
      return true;
    })
    .reply(200, 'OK');

  const callback = async ({
    trackEventStart,
    trackEventEnd,
  }: AnalyticsContextData) => {
    trackEventStart('event', { event_name: 'e1' });
    await new Promise((resolve) => setTimeout(resolve, 10));
    trackEventEnd('event');
  };

  render(
    <TestComponent
      authContext={{
        anonymous: baseAnonymous,
        tokenRefreshed: true,
        visit: baseVisit,
      }}
    >
      <AnalyticsContextTester callback={callback} />
    </TestComponent>,
  );
  await waitForNock();
});

it('should send pending events when page becomes invisible', async () => {
  window.navigator.sendBeacon = jest.fn();

  const callback = async ({ trackEventStart }: AnalyticsContextData) => {
    trackEventStart('event', { event_name: 'e1' });
    await new Promise((resolve) => setTimeout(resolve, 10));
    fireEvent(
      window,
      new CustomEvent('statechange', {
        bubbles: true,
        detail: {
          oldState: 'active',
          newState: 'hidden',
        },
      }),
    );
  };

  render(
    <TestComponent
      authContext={{
        anonymous: baseAnonymous,
        tokenRefreshed: true,
        visit: baseVisit,
      }}
    >
      <AnalyticsContextTester callback={callback} />
    </TestComponent>,
  );
  await waitFor(() => expect(window.navigator.sendBeacon).toBeCalledTimes(1));
});

it('should send pending events when user information is fetched', async () => {
  let done = false;
  const callback = async ({ trackEvent }: AnalyticsContextData) => {
    trackEvent({ event_name: 'e1' });
    // Wait for debounce to finish
    await new Promise((resolve) => setTimeout(resolve, 100));
    done = true;
  };

  const { rerender } = render(
    <TestComponent
      authContext={{
        anonymous: baseAnonymous,
        tokenRefreshed: false,
        visit: baseVisit,
      }}
    >
      <AnalyticsContextTester callback={callback} />
    </TestComponent>,
  );
  await waitFor(() => expect(done).toBeTruthy());
  mockEventsEndpoint();
  rerender(
    <TestComponent
      authContext={{
        anonymous: {
          ...baseAnonymous,
          id: 'u2',
        },
        tokenRefreshed: true,
        visit: {
          sessionId: 's2',
          visitId: 'v2',
        },
      }}
    >
      <AnalyticsContextTester callback={callback} />
    </TestComponent>,
  );
  await waitForNock();
});
