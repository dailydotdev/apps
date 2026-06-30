import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createPostInMultipleSources, PostType } from '../../../graphql/posts';
import { useActions } from '../../../hooks/useActions';
import { usePrompt } from '../../../hooks/usePrompt';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useMultipleSourcePost } from './useMultipleSourcePost';

jest.mock('../../../graphql/posts', () => ({
  ...(jest.requireActual('../../../graphql/posts') as Iterable<unknown>),
  createPostInMultipleSources: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  useActions: jest.fn(),
}));

jest.mock('../../../hooks/usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

describe('useMultipleSourcePost', () => {
  const checkHasCompleted = jest.fn();
  const completeAction = jest.fn();
  const showPrompt = jest.fn();
  const logEvent = jest.fn();
  const onSuccess = jest.fn();
  let client: QueryClient;

  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    client = new QueryClient();
    jest.clearAllMocks();

    checkHasCompleted.mockReturnValue(true);
    jest.mocked(useActions).mockReturnValue({
      isActionsFetched: true,
      checkHasCompleted,
      completeAction,
    } as unknown as ReturnType<typeof useActions>);
    jest.mocked(usePrompt).mockReturnValue({
      showPrompt,
    } as unknown as ReturnType<typeof usePrompt>);
    jest.mocked(useLogContext).mockReturnValue({
      logEvent,
    } as unknown as ReturnType<typeof useLogContext>);
  });

  it('logs the post creation outcome for multi-source creation', async () => {
    jest.mocked(createPostInMultipleSources).mockResolvedValue([
      {
        id: 'post-1',
        sourceId: 'source-1',
        type: 'post',
        slug: 'post-slug',
      },
      {
        id: 'moderation-1',
        sourceId: 'source-2',
        type: 'moderationItem',
      },
    ]);

    const { result } = renderHook(
      () =>
        useMultipleSourcePost({
          onSuccess,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.onCreate({
        sourceIds: ['source-1', 'source-2'],
        title: 'Post title',
        content: 'Post body',
      });
    });

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.CreatePost,
      target_id: 'post-1',
      target_type: 'post',
      extra: JSON.stringify({
        post_type: PostType.Freeform,
        source_count: 2,
        moderation_count: 1,
      }),
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
