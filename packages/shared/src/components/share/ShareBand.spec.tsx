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
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useViewSize } from '../../hooks/useViewSize';

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const mockFeature = jest.mocked(useConditionalFeature);
let isFlagOn: boolean;

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
  isFlagOn = true;
  jest.mocked(useViewSize).mockReturnValue(true);
  mockFeature.mockImplementation(({ shouldEvaluate }) => ({
    value: shouldEvaluate !== false && isFlagOn,
    isLoading: false,
  }));
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

  it('should keep Slack behind the chevron when the flag is off', async () => {
    isFlagOn = false;
    renderBand();

    expect(
      screen.queryByRole('button', { name: /Slack/ }),
    ).not.toBeInTheDocument();

    openChevron();
    expect(await screen.findByTestId('social-share-Slack')).toBeInTheDocument();
  });

  it('should not enroll logged-out readers', () => {
    renderBand({ isLoggedIn: false });

    expect(mockFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
    expect(
      screen.queryByRole('button', { name: /Slack/ }),
    ).not.toBeInTheDocument();
  });
});
