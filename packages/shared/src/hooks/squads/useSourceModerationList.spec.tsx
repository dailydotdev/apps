import React from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import {
  muteSourceAuthor,
  PostModerationReason,
  rejectSourceAuthorPendingPosts,
  SourcePostModerationStatus,
  squadApproveMutation,
  squadRejectMutation,
} from '../../graphql/squads';
import type { SourcePostModeration } from '../../graphql/squads';
import type { Connection } from '../../graphql/common';
import type { Source } from '../../graphql/sources';
import type { Author } from '../../graphql/comments';
import { PostType } from '../../graphql/posts';
import { useSourceModerationList } from './useSourceModerationList';
import { useLazyModal } from '../useLazyModal';
import { usePrompt } from '../usePrompt';
import { useToastNotification } from '../useToastNotification';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { LogEvent } from '../../lib/log';
import { generateQueryKey, RequestKey } from '../../lib/query';

jest.mock('../../graphql/squads', () => ({
  ...(jest.requireActual('../../graphql/squads') as Iterable<unknown>),
  squadApproveMutation: jest.fn(),
  squadRejectMutation: jest.fn(),
  rejectSourceAuthorPendingPosts: jest.fn(),
  muteSourceAuthor: jest.fn(),
}));

jest.mock('../useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));

jest.mock('../usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  ...(jest.requireActual('../../contexts/LogContext') as Iterable<unknown>),
  useLogContext: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  ...(jest.requireActual('../../contexts/AuthContext') as Iterable<unknown>),
  useAuthContext: jest.fn(),
}));

describe('useSourceModerationList', () => {
  const displayToast = jest.fn();
  const openModal = jest.fn();
  const closeModal = jest.fn();
  const showPrompt = jest.fn();
  const logEvent = jest.fn();
  const queueKey = generateQueryKey(
    RequestKey.SquadPostRequests,
    { id: 'user-1' },
    'squad-1',
  );
  let client: QueryClient;

  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const source = { id: 'squad-1', handle: 'squad', name: 'Squad' } as Source;
  const createModerationItem = (
    overrides: Partial<SourcePostModeration>,
  ): SourcePostModeration => ({
    id: 'valid-post',
    status: SourcePostModerationStatus.Pending,
    source,
    createdBy: { id: 'spammer', username: 'spammer' } as Author,
    ...overrides,
  });
  const queue = [
    createModerationItem({ id: 'spam-1' }),
    createModerationItem({ id: 'spam-2' }),
    createModerationItem({
      id: 'other',
      createdBy: { id: 'member', username: 'member' } as Author,
    }),
  ];
  const getQueueIds = () =>
    client
      .getQueryData<InfiniteData<Connection<SourcePostModeration>>>(queueKey)
      ?.pages.flatMap(({ edges }) => edges.map(({ node }) => node.id));

  beforeEach(() => {
    client = new QueryClient();
    client.setQueryData(queueKey, {
      pages: [
        {
          edges: queue.map((node) => ({ node, cursor: node.id })),
          pageInfo: {},
        },
      ],
      pageParams: [''],
    });
    jest.clearAllMocks();

    jest.mocked(useToastNotification).mockReturnValue({
      displayToast,
    } as unknown as ReturnType<typeof useToastNotification>);
    jest.mocked(useLazyModal).mockReturnValue({
      openModal,
      closeModal,
    } as unknown as ReturnType<typeof useLazyModal>);
    jest.mocked(usePrompt).mockReturnValue({
      showPrompt,
    } as unknown as ReturnType<typeof usePrompt>);
    jest.mocked(useLogContext).mockReturnValue({
      logEvent,
    } as unknown as ReturnType<typeof useLogContext>);
    jest.mocked(useAuthContext).mockReturnValue({
      user: { id: 'user-1' },
    } as ReturnType<typeof useAuthContext>);
  });

  it('approves, takes the posts out of the queue and logs each one', async () => {
    jest.mocked(squadApproveMutation).mockResolvedValue([
      createModerationItem({
        id: 'spam-1',
        status: SourcePostModerationStatus.Approved,
        type: PostType.Article,
      }),
    ]);
    const { result } = renderHook(() => useSourceModerationList(), { wrapper });

    await act(async () => {
      await result.current.onApprove([queue[0]]);
    });

    expect(squadApproveMutation).toHaveBeenCalledWith(['spam-1']);
    expect(getQueueIds()).toEqual(['spam-2', 'other']);
    expect(displayToast).toHaveBeenCalledWith('Post approved');
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ApprovePost,
        target_id: 'spam-1',
        feed_item_image: '',
      }),
    );
  });

  it('declines the selected posts with the chosen reason', async () => {
    jest
      .mocked(squadRejectMutation)
      .mockResolvedValue([
        createModerationItem({ id: 'spam-1' }),
        createModerationItem({ id: 'other' }),
      ]);
    const { result } = renderHook(() => useSourceModerationList(), { wrapper });

    act(() => {
      result.current.onReject([queue[0], queue[2]]);
    });

    await act(async () => {
      await openModal.mock.calls[0][0].props.onDecline({
        reason: PostModerationReason.Other,
        note: 'test note',
      });
    });

    expect(squadRejectMutation).toHaveBeenCalledWith({
      postIds: ['spam-1', 'other'],
      sourceId: 'squad-1',
      reason: PostModerationReason.Other,
      note: 'test note',
    });
    expect(muteSourceAuthor).not.toHaveBeenCalled();
    expect(getQueueIds()).toEqual(['spam-2']);
    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(displayToast).toHaveBeenCalledWith('2 posts declined');
    expect(logEvent).toHaveBeenCalledTimes(2);
  });

  it('declines every pending post of the author and mutes them', async () => {
    jest
      .mocked(rejectSourceAuthorPendingPosts)
      .mockResolvedValue([queue[0], queue[1]]);
    jest.mocked(muteSourceAuthor).mockResolvedValue({ _: true });
    const { result } = renderHook(() => useSourceModerationList(), { wrapper });

    act(() => {
      result.current.onReject([queue[0]], { allFromAuthor: true });
    });

    expect(openModal.mock.calls[0][0].props.allFromAuthor).toBe(true);

    await act(async () => {
      await openModal.mock.calls[0][0].props.onDecline({
        reason: PostModerationReason.Spam,
        allFromAuthor: true,
        mute: true,
      });
    });

    expect(rejectSourceAuthorPendingPosts).toHaveBeenCalledWith({
      sourceId: 'squad-1',
      userId: 'spammer',
      reason: PostModerationReason.Spam,
      note: undefined,
    });
    expect(squadRejectMutation).not.toHaveBeenCalled();
    expect(muteSourceAuthor).toHaveBeenCalledWith({
      sourceId: 'squad-1',
      userId: 'spammer',
    });
    expect(getQueueIds()).toEqual(['other']);
    expect(displayToast).toHaveBeenCalledWith(
      '2 posts declined, @spammer muted',
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.MuteSquadAuthor }),
    );
  });

  it('mutes an author, hides their posts and offers to undo', async () => {
    jest.mocked(muteSourceAuthor).mockResolvedValue({ _: true });
    const { result } = renderHook(() => useSourceModerationList(), { wrapper });

    await act(async () => {
      await result.current.onMute(queue[1]);
    });

    expect(getQueueIds()).toEqual(['other']);
    expect(displayToast).toHaveBeenCalledWith(
      '@spammer muted. Their posts skip the queue.',
      { action: expect.objectContaining({ copy: 'Undo' }) },
    );
  });
});
