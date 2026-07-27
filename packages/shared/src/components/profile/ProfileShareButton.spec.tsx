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
import { LogEvent } from '../../lib/log';
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
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ShareProfile,
        target_id: 'u1',
        extra: expect.stringContaining(ShareProvider.CopyLink),
      }),
    );
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
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ShareProfile,
        extra: expect.stringContaining(ShareProvider.Native),
      }),
    );
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
