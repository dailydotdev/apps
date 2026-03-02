import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DigestNotification from './DigestNotification';
import { NotificationType } from './utils';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { NotificationPreferenceStatus } from '../../graphql/notifications';

// eslint-disable-next-line @typescript-eslint/no-use-before-define -- hoisted by jest.mock
let mockNotificationSettings: Record<string, Record<string, string>> = {};

const mockToggleSetting = jest.fn();
const mockSetNotificationStatus = jest.fn();
const mockSubscribe = jest.fn().mockResolvedValue({});
const mockUnsubscribe = jest.fn().mockResolvedValue(null);
const mockGetPersonalizedDigest = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('../../hooks/notifications/useNotificationSettings', () => ({
  __esModule: true,
  default: () => ({
    notificationSettings: mockNotificationSettings,
    toggleSetting: mockToggleSetting,
    setNotificationStatus: mockSetNotificationStatus,
  }),
}));

jest.mock('../../hooks', () => ({
  usePersonalizedDigest: () => ({
    getPersonalizedDigest: mockGetPersonalizedDigest,
    isLoading: false,
    subscribePersonalizedDigest: mockSubscribe,
    unsubscribePersonalizedDigest: mockUnsubscribe,
  }),
  SendType: { Workdays: 'workdays', Daily: 'daily', Weekly: 'weekly' },
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { timezone: 'UTC' } }),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => ({ isPushSupported: true }),
}));

jest.mock('../fields/HourDropdown', () => ({
  HourDropdown: () => <div data-testid="hour-dropdown" />,
}));

const client = new QueryClient();

const renderComponent = () =>
  render(
    <QueryClientProvider client={client}>
      <DigestNotification />
    </QueryClientProvider>,
  );

describe('DigestNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationSettings = {};
    mockGetPersonalizedDigest.mockReturnValue(null);
  });

  describe('mutual exclusivity with Brief', () => {
    it('should unsubscribe Brief and mute BriefingReady.inApp when enabling Digest and Brief subscription exists', () => {
      mockNotificationSettings = {
        [NotificationType.DigestReady]: {
          inApp: NotificationPreferenceStatus.Muted,
        },
      };
      // No Digest subscription, but Brief exists
      mockGetPersonalizedDigest.mockImplementation(
        (type: UserPersonalizedDigestType) =>
          type === UserPersonalizedDigestType.Brief
            ? { type: UserPersonalizedDigestType.Brief, preferredHour: 8 }
            : null,
      );

      renderComponent();

      const toggle = screen.getByRole('checkbox');
      fireEvent.click(toggle);

      expect(mockUnsubscribe).toHaveBeenCalledWith({
        type: UserPersonalizedDigestType.Brief,
      });
      expect(mockSetNotificationStatus).toHaveBeenCalledWith(
        NotificationType.BriefingReady,
        'inApp',
        NotificationPreferenceStatus.Muted,
      );
      expect(mockSubscribe).toHaveBeenCalledWith({
        type: UserPersonalizedDigestType.Digest,
        sendType: 'workdays',
      });
    });

    it('should not unsubscribe Brief when Digest subscription already exists', () => {
      mockNotificationSettings = {
        [NotificationType.DigestReady]: {
          inApp: NotificationPreferenceStatus.Muted,
        },
      };
      // Digest subscription exists
      mockGetPersonalizedDigest.mockImplementation(
        (type: UserPersonalizedDigestType) =>
          type === UserPersonalizedDigestType.Digest
            ? {
                type: UserPersonalizedDigestType.Digest,
                preferredHour: 8,
                flags: { sendType: 'workdays' },
              }
            : null,
      );

      renderComponent();

      const toggle = screen.getByRole('checkbox');
      fireEvent.click(toggle);

      expect(mockUnsubscribe).not.toHaveBeenCalled();
      expect(mockSubscribe).not.toHaveBeenCalled();
      expect(mockSetNotificationStatus).not.toHaveBeenCalled();
    });

    it('should subscribe Digest without touching Brief when no subscriptions exist', () => {
      mockNotificationSettings = {
        [NotificationType.DigestReady]: {
          inApp: NotificationPreferenceStatus.Muted,
        },
      };
      mockGetPersonalizedDigest.mockReturnValue(null);

      renderComponent();

      const toggle = screen.getByRole('checkbox');
      fireEvent.click(toggle);

      expect(mockUnsubscribe).not.toHaveBeenCalled();
      expect(mockSetNotificationStatus).not.toHaveBeenCalled();
      expect(mockSubscribe).toHaveBeenCalledWith({
        type: UserPersonalizedDigestType.Digest,
        sendType: 'workdays',
      });
    });
  });

  describe('cross-channel unsubscribe', () => {
    it('should fully unsubscribe Digest when turning off in-app and email is also off', () => {
      mockNotificationSettings = {
        [NotificationType.DigestReady]: {
          inApp: NotificationPreferenceStatus.Subscribed,
        },
        [NotificationType.BriefingReady]: {
          email: NotificationPreferenceStatus.Muted,
        },
      };
      mockGetPersonalizedDigest.mockImplementation(
        (type: UserPersonalizedDigestType) =>
          type === UserPersonalizedDigestType.Digest
            ? {
                type: UserPersonalizedDigestType.Digest,
                preferredHour: 8,
                flags: { sendType: 'workdays' },
              }
            : null,
      );

      renderComponent();

      const toggle = screen.getByRole('checkbox');
      fireEvent.click(toggle);

      expect(mockUnsubscribe).toHaveBeenCalledWith({
        type: UserPersonalizedDigestType.Digest,
      });
    });

    it('should keep Digest subscription when turning off in-app but email is still on', () => {
      mockNotificationSettings = {
        [NotificationType.DigestReady]: {
          inApp: NotificationPreferenceStatus.Subscribed,
        },
        [NotificationType.BriefingReady]: {
          email: NotificationPreferenceStatus.Subscribed,
        },
      };
      mockGetPersonalizedDigest.mockImplementation(
        (type: UserPersonalizedDigestType) =>
          type === UserPersonalizedDigestType.Digest
            ? {
                type: UserPersonalizedDigestType.Digest,
                preferredHour: 8,
                flags: { sendType: 'workdays' },
              }
            : null,
      );

      renderComponent();

      const toggle = screen.getByRole('checkbox');
      fireEvent.click(toggle);

      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
  });
});
