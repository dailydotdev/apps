import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileShareButton } from './ProfileShareButton';
import { getLogContextStatic } from '../../contexts/LogContext';
import AuthContext from '../../contexts/AuthContext';
import type { AuthContextData } from '../../contexts/AuthContext';
import type { PublicProfile } from '../../lib/user';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import type { ToastNotification } from '../../hooks/useToastNotification';
import { shouldUseNativeShare } from '../../lib/func';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

jest.mock('../../lib/func', () => ({
  ...jest.requireActual('../../lib/func'),
  shouldUseNativeShare: jest.fn(),
}));

const mockShouldUseNativeShare = jest.mocked(shouldUseNativeShare);

const user = {
  id: 'u1',
  name: 'Ido Shamun',
  username: 'idoshamun',
  permalink: 'https://app.daily.dev/idoshamun',
} as PublicProfile;

const logEvent = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);

const setupButton = (
  props: Partial<React.ComponentProps<typeof ProfileShareButton>> = {},
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const LogContext = getLogContextStatic();

  render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={
          {
            user: null,
            isAuthReady: true,
            tokenRefreshed: true,
            squads: [],
          } as unknown as AuthContextData
        }
      >
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: () => false,
          }}
        >
          <ProfileShareButton user={user} {...props} />
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

  return client;
};

describe('ProfileShareButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShouldUseNativeShare.mockReturnValue(false);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it('should label the control for the profile being copied', () => {
    setupButton();

    expect(
      screen.getByLabelText("Copy link to @idoshamun's profile"),
    ).toBeInTheDocument();
  });

  it('should label the control for the logged-in owner', () => {
    setupButton({ isSameUser: true });

    expect(
      screen.getByLabelText('Copy link to your profile'),
    ).toBeInTheDocument();
  });

  it('should copy the profile link and name it in the toast', async () => {
    const client = setupButton();

    await userEvent.click(
      screen.getByLabelText("Copy link to @idoshamun's profile"),
    );

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('https://app.daily.dev/idoshamun'),
    );
    await waitFor(() => {
      const toast = client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY);
      expect(toast?.message).toEqual("✅ Copied link to @idoshamun's profile");
    });
    // Exact payload: `share profile` already ships from the profile menus and
    // the owner share widget, and the post copy-link path uses the same
    // target_id / target_type / stringified {provider, origin} shape. Pin it so
    // the dashboards keep matching.
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ShareProfile,
      target_id: 'u1',
      target_type: TargetType.ProfilePage,
      extra: JSON.stringify({
        provider: ShareProvider.CopyLink,
        origin: Origin.Profile,
      }),
    });
  });

  it('should say "your profile" in the owner toast', async () => {
    const client = setupButton({ isSameUser: true });

    await userEvent.click(screen.getByLabelText('Copy link to your profile'));

    await waitFor(() => {
      const toast = client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY);
      expect(toast?.message).toEqual('✅ Copied link to your profile');
    });
  });

  it('should flip the glyph to a green check while copying', async () => {
    setupButton();

    const button = screen.getByLabelText("Copy link to @idoshamun's profile");
    expect(button.querySelector('.text-status-success')).toBeNull();

    await userEvent.click(button);

    await waitFor(() =>
      expect(button.querySelector('.text-status-success')).toBeInTheDocument(),
    );
  });

  it('should open the native share sheet on mobile when available', async () => {
    mockShouldUseNativeShare.mockReturnValue(true);
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'share', {
      configurable: true,
      value: share,
    });

    setupButton();

    await userEvent.click(
      screen.getByLabelText("Copy link to @idoshamun's profile"),
    );

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        text: "Check out Ido Shamun's profile on daily.dev\nhttps://app.daily.dev/idoshamun",
      }),
    );
    expect(writeText).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ShareProfile,
      target_id: 'u1',
      target_type: TargetType.ProfilePage,
      extra: JSON.stringify({
        provider: ShareProvider.Native,
        origin: Origin.Profile,
      }),
    });
  });

  it('should not log when the native share sheet is dismissed', async () => {
    mockShouldUseNativeShare.mockReturnValue(true);
    Object.defineProperty(globalThis.navigator, 'share', {
      configurable: true,
      value: jest.fn().mockRejectedValue(new Error('AbortError')),
    });

    setupButton();

    await userEvent.click(
      screen.getByLabelText("Copy link to @idoshamun's profile"),
    );

    await waitFor(() => expect(logEvent).not.toHaveBeenCalled());
  });

  it('should not open a share popover on desktop', async () => {
    setupButton();

    await userEvent.click(
      screen.getByLabelText("Copy link to @idoshamun's profile"),
    );

    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(screen.queryByText('LinkedIn')).not.toBeInTheDocument();
  });
});
