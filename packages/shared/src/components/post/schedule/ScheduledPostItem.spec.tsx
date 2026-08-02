import React from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ScheduledPostItem } from './ScheduledPostItem';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePrompt } from '../../../hooks/usePrompt';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { Connection } from '../../../graphql/common';
import type { ScheduledPost } from '../../../graphql/posts';
import { DELETE_POST_MUTATION } from '../../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { defaultQueryClientTestingConfig } from '../../../../__tests__/helpers/tanstack-query';

jest.mock('../../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../../contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

jest.mock('../../../hooks/usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => children,
}));

const user = { id: 'user-1', timezone: 'UTC' };

const post = {
  id: 'post-1',
  title: 'Scheduled title',
  flags: { scheduledAt: '2026-08-10T10:00:00.000Z' },
  source: { id: 'source-1', handle: 'squad', name: 'My Squad', image: '' },
} as ScheduledPost;

const scheduledPostsKey = generateQueryKey(RequestKey.ScheduledPosts, user);

const showPrompt = jest.fn();
const displayToast = jest.fn();

const setupItem = () => {
  const client = new QueryClient(defaultQueryClientTestingConfig);
  client.setQueryData<InfiniteData<Connection<ScheduledPost>>>(
    scheduledPostsKey,
    {
      pages: [
        {
          edges: [{ node: post }],
          pageInfo: { endCursor: '', hasNextPage: false },
        },
      ],
      pageParams: [''],
    },
  );

  render(
    <QueryClientProvider client={client}>
      <ScheduledPostItem post={post} />
    </QueryClientProvider>,
  );

  return client;
};

const getCachedIds = (client: QueryClient) => {
  const data =
    client.getQueryData<InfiniteData<Connection<ScheduledPost>>>(
      scheduledPostsKey,
    );

  if (!data) {
    throw new Error('scheduled posts cache is missing');
  }

  return data.pages.flatMap((page) => page.edges.map((edge) => edge.node.id));
};

describe('ScheduledPostItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
    jest.mocked(useAuthContext).mockReturnValue({
      user,
    } as ReturnType<typeof useAuthContext>);
    jest.mocked(usePrompt).mockReturnValue({
      showPrompt,
      prompt: null,
    });
    jest.mocked(useToastNotification).mockReturnValue({
      displayToast,
      dismissToast: jest.fn(),
      subject: null,
    } as unknown as ReturnType<typeof useToastNotification>);
  });

  it('deletes the post and drops it from the list once confirmed', async () => {
    showPrompt.mockResolvedValue(true);
    let requested = false;
    mockGraphQL({
      request: { query: DELETE_POST_MUTATION, variables: { id: post.id } },
      result: () => {
        requested = true;
        return { data: { deletePost: { _: true } } };
      },
    });

    const client = setupItem();
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete scheduled post' }),
    );

    await waitFor(() => expect(requested).toBe(true));
    await waitFor(() => expect(getCachedIds(client)).toEqual([]));
    expect(displayToast).toHaveBeenCalledWith('Scheduled post deleted');
  });

  it('keeps the post when the confirmation is dismissed', async () => {
    showPrompt.mockResolvedValue(false);

    const client = setupItem();
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete scheduled post' }),
    );

    await waitFor(() => expect(showPrompt).toHaveBeenCalled());
    expect(getCachedIds(client)).toEqual([post.id]);
    expect(displayToast).not.toHaveBeenCalled();
  });
});
