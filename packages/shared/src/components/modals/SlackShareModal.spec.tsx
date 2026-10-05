import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { get as getCache } from 'idb-keyval';
import SlackShareModal from './SlackShareModal';
import post from '../../../__tests__/fixture/post';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { gqlClient } from '../../graphql/common';
import type { UserIntegration } from '../../graphql/integrations';
import {
  INTEGRATION_RECENT_CHANNELS_QUERY,
  INTEGRATION_SHARE_IMAGE_MUTATION,
  integrationRecentChannelsQueryOptions,
  SLACK_CHANNELS_QUERY,
  UserIntegrationType,
} from '../../graphql/integrations';
import { slackShareSnapshotKey } from '../../hooks/integrations/slack/useSlackShareButton';
import { generateQueryKey, RequestKey } from '../../lib/query';

const mockConnect = jest.fn();
const mockDisplayToast = jest.fn();
const mockShare = jest.fn();
const mockStore = new Map<string, unknown>();

// jsdom's Blob cannot be structured-cloned into fake-indexeddb
jest.mock('idb-keyval', () => ({
  ...jest.requireActual('idb-keyval'),
  get: async (key: string) => mockStore.get(key),
  set: async (key: string, value: unknown) => {
    mockStore.set(key, value);
  },
  del: async (key: string) => {
    mockStore.delete(key);
  },
}));

jest.mock('../../hooks/integrations/slack/useSlack', () => ({
  useSlack: () => ({ connect: mockConnect, connectSource: jest.fn() }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../hooks/useToastNotification'),
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

const channel = { id: 'c1', name: 'general' };
const snapshot = {
  image: new Blob(['snapshot'], { type: 'image/png' }),
  filename: 'tldr',
};
const missingScopeError = {
  response: {
    errors: [
      {
        message: 'Reconnect Slack',
        extensions: {
          code: 'FORBIDDEN',
          reason: 'INTEGRATION_MISSING_SCOPE',
          scope: 'files:write',
        },
      },
    ],
  },
};

const renderModal = (integration: Partial<UserIntegration>) => {
  const client = new QueryClient();
  const slackIntegration = {
    id: 'slack-1',
    type: UserIntegrationType.Slack,
    name: 'daily.dev',
    canPostAsUser: true,
    ...integration,
  };
  client.setQueryData(
    generateQueryKey(RequestKey.UserIntegrations, loggedUser),
    [slackIntegration],
  );
  client.setQueryData(
    integrationRecentChannelsQueryOptions({
      integrationId: slackIntegration.id,
      user: loggedUser,
    }).queryKey,
    [channel],
  );

  return render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <SlackShareModal
        isOpen
        ariaHideApp={false}
        post={post}
        snapshot={snapshot}
        onRequestClose={jest.fn()}
      />
    </TestBootProvider>,
  );
};

beforeAll(() => {
  URL.createObjectURL = jest.fn().mockReturnValue('blob:snapshot');
  URL.revokeObjectURL = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.clear();
  jest.spyOn(gqlClient, 'request').mockImplementation((async (
    query: string,
    variables: unknown,
  ) => {
    if (query === SLACK_CHANNELS_QUERY) {
      return { slackChannels: { data: [channel], cursor: null } };
    }

    if (query === INTEGRATION_RECENT_CHANNELS_QUERY) {
      return { integrationRecentChannels: [channel] };
    }

    return query.includes('integrationSharePost')
      ? mockShare(query, variables)
      : {};
  }) as never);
});

it('should send the snapshot under the message, without the post', async () => {
  mockShare.mockResolvedValue({ integrationSharePost: { _: true } });
  renderModal({ canShareImages: true });

  fireEvent.input(screen.getByPlaceholderText('Add a message (optional)'), {
    target: { value: '  Worth a read  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: '#general' }));

  await waitFor(() =>
    expect(mockDisplayToast).toHaveBeenCalledWith('Shared to Slack'),
  );
  const [query, variables] = mockShare.mock.calls[0];
  expect(query).toBe(INTEGRATION_SHARE_IMAGE_MUTATION);
  expect(query).toContain('attachPost: false');
  expect(variables).toEqual({
    integrationId: 'slack-1',
    channelId: channel.id,
    postId: post.id,
    message: 'Worth a read',
    image: expect.any(File),
  });
  expect(variables.image.name).toBe('tldr.png');
});

it('should ask to reconnect, keeping the snapshot, when images are not allowed yet', async () => {
  renderModal({ canShareImages: false, canPostAsUser: false });

  expect(
    screen.queryByRole('button', { name: 'Share' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(/posts as the daily.dev app/),
  ).not.toBeInTheDocument();
  fireEvent.input(screen.getByPlaceholderText('Add a message (optional)'), {
    target: { value: 'Worth a read' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Reconnect Slack' }));

  await waitFor(() => expect(mockConnect).toHaveBeenCalledTimes(1));
  expect(mockConnect.mock.calls[0][0].redirectPath).toContain(
    'slackSnapshot=1',
  );
  expect(await getCache(slackShareSnapshotKey)).toMatchObject({
    postId: post.id,
    filename: 'tldr',
    message: 'Worth a read',
  });
  expect(mockShare).not.toHaveBeenCalled();
});

it('should switch to the reconnect prompt when Slack refuses the image', async () => {
  mockShare.mockRejectedValue(missingScopeError);
  renderModal({ canShareImages: true });

  fireEvent.click(screen.getByRole('button', { name: '#general' }));

  expect(
    await screen.findByRole('button', { name: 'Reconnect Slack' }),
  ).toBeInTheDocument();
  expect(mockDisplayToast).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Reconnect Slack' }));

  await waitFor(() => expect(mockConnect).toHaveBeenCalledTimes(1));
  expect(await getCache(slackShareSnapshotKey)).toMatchObject({
    channel,
  });
});
