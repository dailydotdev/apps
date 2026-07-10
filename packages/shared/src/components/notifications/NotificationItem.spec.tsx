import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { NotificationItemProps } from './NotificationItem';
import NotificationItem from './NotificationItem';
import {
  NotificationAttachmentType,
  NotificationAvatarType,
} from '../../graphql/notifications';
import { NotificationType, NotificationIconType } from './utils';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import * as njord from '../../graphql/njord';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        pathname: '/',
        isReady: true,
        query: {},
      } as unknown as NextRouter),
  );
});

const sampleNotificationTitle = 'Welcome to your new notification center!';
const sampleNotificationDescription =
  'The notification system notifies you of important events such as replies, mentions, updates etc.';
const sampleNotificationAttachments = [
  {
    title: 'Sample attachment',
    image: 'sample attachment image',
    type: NotificationAttachmentType.Post,
  },
];
const sampleNotificationAvatars = [
  {
    name: 'source',
    image: 'source avatar',
    referenceId: 'source',
    targetUrl: 'webapp/source',
    type: NotificationAvatarType.Source,
  },
  {
    name: 'user',
    image: 'user avatar',
    referenceId: 'user',
    targetUrl: 'webapp/user',
    type: NotificationAvatarType.User,
  },
];
const sampleNotification: NotificationItemProps = {
  isUnread: true,
  icon: NotificationIconType.Comment,
  title: `<p>${sampleNotificationTitle}</p>`,
  description: `<p>${sampleNotificationDescription}</p>`,
  type: NotificationType.System,
  referenceId: 'sample-notification',
  targetUrl: 'post url',
  attachments: sampleNotificationAttachments,
  avatars: sampleNotificationAvatars,
};

const mockReact = React;

jest.mock(
  'next/link',
  () =>
    ({ children, ...rest }: { children: ReactElement }) =>
      mockReact.cloneElement(children, { ...rest }),
);

const renderComponent = (component: ReactNode) => {
  const client = new QueryClient();
  render(<TestBootProvider client={client}>{component}</TestBootProvider>);
};

describe('notification attachment', () => {
  it('should display image', async () => {
    const [attachment] = sampleNotificationAttachments;
    renderComponent(<NotificationItem {...sampleNotification} />);
    const img = await screen.findByAltText(
      `Cover preview of: ${attachment.title}`,
    );
    expect(img).toHaveAttribute('src', attachment.image);
  });

  it('should show the post title as the subtitle (and cover image) when there is no comment', async () => {
    const [attachment] = sampleNotificationAttachments;
    renderComponent(
      <NotificationItem {...sampleNotification} description={undefined} />,
    );
    await screen.findByText(attachment.title);
    await screen.findByAltText(`Cover preview of: ${attachment.title}`);
  });

  it('should not repeat the post title when it matches the notification title', async () => {
    renderComponent(
      <NotificationItem
        {...sampleNotification}
        description={undefined}
        title="<p>Same post title</p>"
        attachments={[
          { ...sampleNotificationAttachments[0], title: 'Same post title' },
        ]}
      />,
    );
    const matches = await screen.findAllByText('Same post title');
    expect(matches).toHaveLength(1);
  });
});

describe('notification avatars', () => {
  it('should display the avatar of the source', async () => {
    const [source] = sampleNotificationAvatars;
    // A single avatar renders the rich source/user avatar (multiple actors
    // render as an overlapping stack instead).
    renderComponent(
      <NotificationItem {...sampleNotification} avatars={[source]} />,
    );
    const img = await screen.findByAltText(`${source.referenceId}'s profile`);
    expect(img).toHaveAttribute('src', source.image);
  });

  it('should display the avatar of the user', async () => {
    const [, user] = sampleNotificationAvatars;
    // Only the primary (first) avatar is shown, so render the user as the
    // single avatar to verify user avatars render.
    renderComponent(
      <NotificationItem {...sampleNotification} avatars={[user]} />,
    );
    const img = await screen.findByAltText(`${user.referenceId}'s profile`);
    expect(img).toHaveAttribute('src', user.image);
  });

  it('should not display anything if the type is unknown', async () => {
    const [source] = sampleNotificationAvatars;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unknownAvatar = { ...source, type: 'Test' } as any;
    renderComponent(
      <NotificationItem {...sampleNotification} avatars={[unknownAvatar]} />,
    );
    const img = screen.queryByAltText(`${source.referenceId}'s profile`);
    expect(img).not.toBeInTheDocument();
  });
});

describe('notification item', () => {
  it('should display the icon of the notification', async () => {
    renderComponent(
      <NotificationItem {...sampleNotification} avatars={undefined} />,
    );
    const testid = `notification-${sampleNotification.icon}`;
    const img = await screen.findByTestId(testid);
    expect(img).toBeInTheDocument();
  });

  it('should display the default icon if the passed icon is unknown', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notification = { ...sampleNotification, avatars: undefined } as any; // using any to validate unknown icon
    notification.icon = 'new notif';
    renderComponent(<NotificationItem {...notification} />);
    const testid = `notification-${notification.icon}`;
    const img = await screen.findByTestId(testid);
    expect(img).toHaveAttribute(
      'data-testvalue',
      NotificationIconType.DailyDev,
    );
  });

  it('should have a title that supports html', async () => {
    renderComponent(<NotificationItem {...sampleNotification} />);
    await screen.findByText(sampleNotificationTitle);
  });

  it('should have a description that supports html', async () => {
    renderComponent(<NotificationItem {...sampleNotification} />);
    await screen.findByText(sampleNotificationDescription);
  });

  it('should not render the description when it duplicates the title', async () => {
    renderComponent(
      <NotificationItem
        {...sampleNotification}
        title="<p>Exactly the same</p>"
        description="<p>Exactly the same</p>"
      />,
    );
    const matches = await screen.findAllByText('Exactly the same');
    expect(matches).toHaveLength(1);
  });
});

describe('notification click if onClick prop is provided', () => {
  it('should call provided onClick', async () => {
    const mockOnClick = jest.fn();
    renderComponent(
      <NotificationItem {...sampleNotification} onClick={mockOnClick} />,
    );

    const notificationLink = await screen.findByTestId('openNotification');
    expect(notificationLink).toBeInTheDocument();
    expect(notificationLink).toHaveAttribute('href', 'post url');

    fireEvent.click(notificationLink);
    await waitFor(() => expect(mockOnClick).toBeCalledTimes(1));
  });
});
describe('notification click if onClick prop is NOT provided', () => {
  it('should not render link', async () => {
    renderComponent(<NotificationItem {...sampleNotification} />);

    expect(screen.queryByTestId('openNotification')).not.toBeInTheDocument();
  });
});

describe('UserReceivedAward say thanks action', () => {
  const receivedAwardNotification: NotificationItemProps = {
    isUnread: true,
    icon: NotificationIconType.Core,
    title: '<p><b>user</b> awarded you +10 Cores for being awesome!</p>',
    type: NotificationType.UserReceivedAward,
    referenceId: '5a2c2b3a-4d6e-4f70-8a91-b2c3d4e5f607',
    targetUrl: '/user',
    avatars: [sampleNotificationAvatars[1]],
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the "Say thanks" action on the recipient notification', async () => {
    renderComponent(<NotificationItem {...receivedAwardNotification} />);
    await screen.findByText('Say thanks');
  });

  it('should not render the action on other notification types', async () => {
    renderComponent(<NotificationItem {...sampleNotification} />);
    await screen.findByText(sampleNotificationTitle);
    expect(screen.queryByText('Say thanks')).not.toBeInTheDocument();
  });

  it('should call the mutation and swap to the "Thanked" state on success', async () => {
    const spy = jest
      .spyOn(njord, 'sayThanksForAward')
      .mockResolvedValue({} as njord.UserTransaction);

    renderComponent(<NotificationItem {...receivedAwardNotification} />);

    const button = await screen.findByText('Say thanks');
    fireEvent.click(button);

    await screen.findByText('Thanked');
    expect(spy).toHaveBeenCalledWith({
      transactionId: receivedAwardNotification.referenceId,
    });
    expect(screen.queryByText('Say thanks')).not.toBeInTheDocument();
  });

  it('should render the sender UserAwardThanked notification without a say thanks action', async () => {
    renderComponent(
      <NotificationItem
        {...receivedAwardNotification}
        type={NotificationType.UserAwardThanked}
        title="<p><b>user</b> said thanks for your Award</p>"
      />,
    );
    await screen.findByText(/said thanks for your Award/);
    expect(screen.queryByText('Say thanks')).not.toBeInTheDocument();
  });
});

describe('ExperienceCompanyEnriched notification', () => {
  const experienceCompanyEnrichedNotification: NotificationItemProps = {
    isUnread: true,
    icon: NotificationIconType.Bell,
    title: 'Your work experience has been linked to Acme Corp',
    type: NotificationType.ExperienceCompanyEnriched,
    referenceId: 'experience-company-enriched',
    targetUrl: '/recruiter/profile',
  };

  it('should display the title', async () => {
    renderComponent(
      <NotificationItem {...experienceCompanyEnrichedNotification} />,
    );
    await screen.findByText(
      'Your work experience has been linked to Acme Corp',
    );
  });

  it('should display the Bell icon', async () => {
    renderComponent(
      <NotificationItem {...experienceCompanyEnrichedNotification} />,
    );
    const icon = await screen.findByTestId('notification-Bell');
    expect(icon).toBeInTheDocument();
  });

  it('should be clickable and navigate to targetUrl', async () => {
    const mockOnClick = jest.fn();
    renderComponent(
      <NotificationItem
        {...experienceCompanyEnrichedNotification}
        onClick={mockOnClick}
      />,
    );

    const notificationLink = await screen.findByTestId('openNotification');
    expect(notificationLink).toBeInTheDocument();
    expect(notificationLink).toHaveAttribute('href', '/recruiter/profile');

    fireEvent.click(notificationLink);
    await waitFor(() => expect(mockOnClick).toBeCalledTimes(1));
  });
});
