import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { ShareBand } from './ShareBand';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import post from '../../../__tests__/fixture/post';
import type { UserIntegration } from '../../graphql/integrations';
import { UserIntegrationType } from '../../graphql/integrations';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useViewSize } from '../../hooks/useViewSize';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const slackIntegration = {
  id: 'integration-1',
  type: UserIntegrationType.Slack,
  name: 'Acme',
} as UserIntegration;

const renderBand = ({
  isLoggedIn = true,
  integrations = [],
}: {
  isLoggedIn?: boolean;
  /** `null` leaves the integrations query in flight. */
  integrations?: UserIntegration[] | null;
} = {}) => {
  const user = isLoggedIn ? loggedUser : undefined;
  const client = new QueryClient();

  if (integrations) {
    client.setQueryData(
      generateQueryKey(RequestKey.UserIntegrations, user),
      integrations,
    );
  }

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      <ShareBand
        title="Should anyone else see this post?"
        description="Send it to someone who’d have opinions."
        link={post.commentsPermalink}
        text={post.title ?? ''}
        post={post}
        onShare={jest.fn()}
      />
    </TestBootProvider>,
  );
};

const openChevron = () =>
  fireEvent.keyDown(
    screen.getByRole('button', { name: 'More share options' }),
    {
      key: 'Enter',
    },
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useViewSize).mockReturnValue(true);
});

describe('ShareBand', () => {
  it('should offer to connect Slack beside Copy link, and only there', async () => {
    renderBand();

    expect(
      screen.getByRole('button', { name: 'Connect Slack' }),
    ).toBeInTheDocument();

    openChevron();
    expect(await screen.findByText('X')).toBeInTheDocument();
    expect(screen.queryByTestId('social-share-Slack')).not.toBeInTheDocument();
  });

  it('should offer to send once a workspace is connected', () => {
    renderBand({ integrations: [slackIntegration] });

    expect(
      screen.getByRole('button', { name: 'Send to Slack' }),
    ).toBeInTheDocument();
  });

  it('should hold a disabled neutral state until integrations settle', () => {
    renderBand({ integrations: null });

    expect(
      screen.getByRole('button', { name: 'Send to Slack' }),
    ).toBeDisabled();
    expect(screen.queryByText('Connect Slack')).not.toBeInTheDocument();
  });

  it('should keep Slack behind the chevron for logged-out readers', async () => {
    renderBand({ isLoggedIn: false });

    expect(
      screen.queryByRole('button', { name: /Slack/ }),
    ).not.toBeInTheDocument();

    openChevron();
    expect(await screen.findByTestId('social-share-Slack')).toBeInTheDocument();
  });
});
