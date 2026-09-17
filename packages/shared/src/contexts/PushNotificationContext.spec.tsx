import React from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import OneSignal from 'react-onesignal';
import {
  PushNotificationContextProvider,
  usePushNotificationContext,
} from './PushNotificationContext';
import { syncWebPushSubscription } from '../graphql/notifications';
import { NotificationPromptSource } from '../lib/log';
import { storageWrapper } from '../lib/storageWrapper';
import { isIOSNative } from '../lib/func';
import { postWebKitMessage, WebKitMessageHandlers } from '../lib/ios';

jest.mock('../lib/func', () => ({
  ...jest.requireActual('../lib/func'),
  isIOSNative: jest.fn(() => false),
}));

jest.mock('../lib/ios', () => ({
  ...jest.requireActual('../lib/ios'),
  postWebKitMessage: jest.fn(),
}));

const mockUser = { id: 'u1' };
jest.mock('./AuthContext', () => ({
  useAuthContext: () => ({ user: mockUser }),
}));

const mockLogEvent = jest.fn();
jest.mock('./LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../lib/constants', () => ({
  ...jest.requireActual('../lib/constants'),
  isTesting: false,
}));

jest.mock('../graphql/notifications', () => ({
  syncWebPushSubscription: jest.fn().mockResolvedValue({}),
}));

jest.mock('react-onesignal', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    login: jest.fn(),
    Notifications: {
      permission: true,
      isPushSupported: jest.fn(() => true),
      requestPermission: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    User: {
      PushSubscription: {
        id: 'subscription-1',
        optedIn: false,
        optIn: jest.fn(),
        optOut: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    },
  },
}));

const source = NotificationPromptSource.NotificationsPage;
const subscription = OneSignal.User.PushSubscription;

const renderPushContext = (
  client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
) =>
  renderHook(usePushNotificationContext, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <PushNotificationContextProvider>
          <>{children}</>
        </PushNotificationContextProvider>
      </QueryClientProvider>
    ),
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(isIOSNative).mockReturnValue(false);
  storageWrapper.clear();
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID = 'app-id';
  OneSignal.Notifications.permission = true;
  subscription.optedIn = false;
  jest.mocked(OneSignal.init).mockResolvedValue();
  jest.mocked(subscription.optIn).mockImplementation(async () => {
    subscription.optedIn = true;
  });
  jest.mocked(subscription.optOut).mockImplementation(async () => {
    subscription.optedIn = false;
  });
});

it('waits for the push SDK to initialize before reporting readiness', async () => {
  let finishInit: () => void = () => undefined;
  jest.mocked(OneSignal.init).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishInit = resolve;
      }),
  );
  const { result } = renderPushContext();

  await waitFor(() => expect(OneSignal.init).toHaveBeenCalled());
  expect(result.current.isInitialized).toBe(false);

  await act(async () => finishInit());

  await waitFor(() => expect(result.current.isInitialized).toBe(true));
  expect(result.current.isPushSupported).toBe(true);
});

it('restores the subscription when remounting with the cached SDK', async () => {
  subscription.optedIn = true;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const { result: initialResult, unmount } = renderPushContext(client);
  await waitFor(() => expect(initialResult.current.isSubscribed).toBe(true));
  unmount();

  const { result } = renderPushContext(client);

  await waitFor(() => expect(result.current.isSubscribed).toBe(true));
  expect(OneSignal.init).toHaveBeenCalledTimes(1);
});

it('waits for the native push state before reporting readiness', async () => {
  jest.mocked(isIOSNative).mockReturnValue(true);
  const { result } = renderPushContext();

  await waitFor(() =>
    expect(postWebKitMessage).toHaveBeenCalledWith(
      WebKitMessageHandlers.PushState,
      null,
    ),
  );
  expect(result.current.isInitialized).toBe(false);

  act(() => {
    window.dispatchEvent(new CustomEvent('push-state', { detail: true }));
  });

  await waitFor(() => expect(result.current.isInitialized).toBe(true));
  expect(result.current.isSubscribed).toBe(true);
});

it('waits for opt-in after browser permission is granted', async () => {
  OneSignal.Notifications.permission = false;
  jest
    .mocked(OneSignal.Notifications.requestPermission)
    .mockImplementationOnce(async () => {
      OneSignal.Notifications.permission = true;
    });
  const { result } = renderPushContext();
  await waitFor(() => expect(result.current.isPushSupported).toBe(true));

  await act(async () => {
    expect(await result.current.subscribe(source)).toBe(true);
  });

  expect(subscription.optIn).toHaveBeenCalledTimes(1);
  expect(result.current.isSubscribed).toBe(true);
  expect(syncWebPushSubscription).toHaveBeenCalledWith(
    expect.objectContaining({
      subscriptionId: 'subscription-1',
      optedIn: true,
    }),
  );
});

it('does not report a subscription when permission is granted but opt-in fails', async () => {
  jest.mocked(subscription.optIn).mockResolvedValueOnce();
  const { result } = renderPushContext();
  await waitFor(() => expect(result.current.isPushSupported).toBe(true));

  await act(async () => {
    expect(await result.current.subscribe(source)).toBe(false);
  });

  expect(result.current.isSubscribed).toBe(false);
  expect(mockLogEvent).not.toHaveBeenCalled();
});

it('does not opt in when browser permission is denied', async () => {
  OneSignal.Notifications.permission = false;
  const { result } = renderPushContext();
  await waitFor(() => expect(result.current.isPushSupported).toBe(true));

  await act(async () => {
    expect(await result.current.subscribe(source)).toBe(false);
  });

  expect(subscription.optIn).not.toHaveBeenCalled();
  expect(syncWebPushSubscription).not.toHaveBeenCalled();
});

it('syncs the same subscription again after notifications are disabled and enabled', async () => {
  subscription.optedIn = true;
  const { result } = renderPushContext();
  await waitFor(() => expect(syncWebPushSubscription).toHaveBeenCalledTimes(1));

  await act(async () => {
    await result.current.unsubscribe(source);
  });
  expect(result.current.isSubscribed).toBe(false);

  await act(async () => {
    await result.current.subscribe(source);
  });

  expect(syncWebPushSubscription).toHaveBeenLastCalledWith(
    expect.objectContaining({
      subscriptionId: 'subscription-1',
      optedIn: true,
    }),
  );
  expect(syncWebPushSubscription).toHaveBeenCalledTimes(3);
});

it('repairs a stale sync marker when explicitly enabling notifications', async () => {
  storageWrapper.setItem('web-push-subscription-synced', 'u1:subscription-1');
  const { result } = renderPushContext();
  await waitFor(() => expect(result.current.isPushSupported).toBe(true));

  await act(async () => {
    await result.current.subscribe(source);
  });

  expect(syncWebPushSubscription).toHaveBeenCalledWith(
    expect.objectContaining({
      subscriptionId: 'subscription-1',
      optedIn: true,
    }),
  );
});

it('updates the subscription when browser permission is revoked', async () => {
  subscription.optedIn = true;
  const { result } = renderPushContext();
  await waitFor(() => expect(result.current.isSubscribed).toBe(true));
  const listener = jest
    .mocked(OneSignal.Notifications.addEventListener)
    .mock.calls.find(([event]) => event === 'permissionChange')?.[1];

  act(() => {
    OneSignal.Notifications.permission = false;
    listener?.(false);
  });

  expect(result.current.isSubscribed).toBe(false);
});
