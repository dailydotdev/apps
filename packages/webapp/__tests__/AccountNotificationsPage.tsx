import React from 'react';
import nock from 'nock';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import type { Visit } from '@dailydotdev/shared/src/lib/boot';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { PushNotificationContextProvider } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import {
  GET_PERSONALIZED_DIGEST_SETTINGS,
  SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UserPersonalizedDigestType,
  GET_NOTIFICATION_SETTINGS,
} from '@dailydotdev/shared/src/graphql/users';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { SendType } from '@dailydotdev/shared/src/hooks';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { settingsContext } from '@dailydotdev/shared/__tests__/helpers/boot';
import { NotificationPreferenceStatus } from '@dailydotdev/shared/src/graphql/notifications';
import { NotificationType } from '@dailydotdev/shared/src/components/notifications/utils';
import ProfileNotificationsPage from '../pages/settings/notifications';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      isFallback: false,
    };
  },
}));

let client: QueryClient;
let personalizedDigestMock: MockedGraphQLResponse;
let notificationSettingsMock: MockedGraphQLResponse;
const logEvent = jest.fn();

const defaultNotificationSettings = {
  [NotificationType.CommentReply]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.ArticleUpvoteMilestone]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.CommentUpvoteMilestone]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.UserReceivedAward]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.ArticleReportApproved]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.SourcePostAdded]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.UserPostAdded]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.CollectionUpdated]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.PostBookmarkReminder]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.StreakReminder]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.StreakResetRestore]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.BriefingReady]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.ArticleNewComment]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.SquadNewComment]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.SquadReply]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.PostMention]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
  [NotificationType.CommentMention]: {
    email: NotificationPreferenceStatus.Subscribed,
    inApp: NotificationPreferenceStatus.Subscribed,
  },
};

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  client = new QueryClient();

  globalThis.OneSignal = {
    getRegistrationId: jest.fn().mockResolvedValue('123'),
  };

  personalizedDigestMock = {
    request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
    result: {
      errors: [
        {
          message: 'Not subscribed to personalized digest',
          extensions: {
            code: ApiError.NotFound,
          },
        },
      ],
    },
  };

  notificationSettingsMock = {
    request: { query: GET_NOTIFICATION_SETTINGS },
    result: {
      data: {
        notificationSettings: defaultNotificationSettings,
      },
    },
  };
});

afterEach(() => {
  delete globalThis.OneSignal;
});

const defaultLoggedUser: LoggedUser = {
  ...loggedUser,
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  acceptedMarketing: false,
  isPlus: true,
};
const defaultVisit: Visit = {
  sessionId: 'sample session id',
  visitId: 'sample visit id',
};

const updateUser = jest.fn();

globalThis.Notification = {
  requestPermission: jest.fn(),
  permission: 'default',
} as unknown as jest.Mocked<typeof Notification>;

jest
  .spyOn(window.Notification, 'requestPermission')
  .mockResolvedValueOnce('granted');

const renderComponent = (
  user = defaultLoggedUser,
  customNotificationSettings = defaultNotificationSettings,
): RenderResult => {
  mockGraphQL(personalizedDigestMock);
  mockGraphQL({
    ...notificationSettingsMock,
    result: {
      data: {
        notificationSettings: customNotificationSettings,
      },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        updateUser={updateUser}
        getRedirectUri={jest.fn()}
        visit={defaultVisit}
        tokenRefreshed
      >
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <SettingsContext.Provider value={settingsContext}>
            <PushNotificationContextProvider>
              <NotificationsContextProvider app={BootApp.Webapp}>
                <ProfileNotificationsPage />
              </NotificationsContextProvider>
            </PushNotificationContextProvider>
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should show email tab content when clicked', async () => {
  renderComponent();

  const emailTab = await screen.findByText('Email');
  fireEvent.click(emailTab);

  const unsubscribeAllSection = await screen.findByText(
    'Unsubscribe from all email notifications',
  );
  expect(unsubscribeAllSection).toBeInTheDocument();
});

it('should render comments switch', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Comments on your posts')).toBeInTheDocument();
  });
});

it('should render reply switch', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Replies to your comment')).toBeInTheDocument();
  });
});

it('should render following switch', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Following')).toBeInTheDocument();
  });
});

it('should render upvotes switch', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Upvotes on your post')).toBeInTheDocument();
  });
});

it('should render AI briefings switch', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Presidential briefings')).toBeInTheDocument();
  });
});

it('should render notification categories', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Activity')).toBeInTheDocument();
  });
});

it('should change hour for AI briefings', async () => {
  personalizedDigestMock = {
    request: { query: GET_PERSONALIZED_DIGEST_SETTINGS, variables: {} },
    result: {
      data: {
        personalizedDigest: [
          {
            preferredDay: 1,
            preferredHour: 9,
            type: UserPersonalizedDigestType.Brief,
            flags: {
              sendType: SendType.Weekly,
            },
          },
        ],
      },
    },
  };

  renderComponent();

  // Wait for the Presidential briefings section to be fully rendered first
  await waitFor(() => {
    expect(screen.getByText('Presidential briefings')).toBeInTheDocument();
  });

  // Wait for the digest settings to load and the Weekly option to appear
  const subscription = await screen.findByLabelText('Weekly');
  await waitFor(() => expect(subscription).toBeChecked());

  mockGraphQL({
    request: {
      query: SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
      variables: {
        day: 3,
        hour: 0,
        type: UserPersonalizedDigestType.Brief,
        sendType: SendType.Weekly,
      },
    },
    result: {
      data: {
        subscribePersonalizedDigest: {
          preferredDay: 1,
          preferredHour: 0,
          type: UserPersonalizedDigestType.Brief,
          flags: {
            sendType: SendType.Weekly,
          },
        },
      },
    },
  });

  const { firstChild } = await screen.findByTestId('hour-dropdown');
  fireEvent.click(firstChild);
  const selectedHour = await screen.findByText('00:00');
  fireEvent.click(selectedHour);

  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'schedule digest',
    extra: JSON.stringify({ hour: 0, frequency: 'weekly' }),
  });
});

it('should render streaks section', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Streaks')).toBeInTheDocument();
  });
});

it('should render achievements section', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Achievements')).toBeInTheDocument();
  });
});

it('should render push notifications switch', async () => {
  renderComponent();

  const pushSwitch = await screen.findByTestId('push_notification-switch');
  expect(pushSwitch).toBeInTheDocument();
});

it('should render squad notifications section', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Squad notifications')).toBeInTheDocument();
  });
});

it('should render mentions switch', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Mentions of your username')).toBeInTheDocument();
  });
});

it('should render upvote comments switch', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Upvotes on your comment')).toBeInTheDocument();
  });
});

it('should render cores and awards switch', async () => {
  renderComponent();

  await waitFor(() => {
    expect(
      screen.queryByText('Cores & Awards you receive'),
    ).toBeInTheDocument();
  });
});

it('should render source suggestions section', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Source suggestions')).toBeInTheDocument();
  });
});

it('should render submitted post section', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Submitted post review')).toBeInTheDocument();
  });
});

it('should render squad roles section', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText('Squad roles')).toBeInTheDocument();
  });
});
