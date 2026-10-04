import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { useMutateComment } from './useMutateComment';
import { useRequestProtocol } from '../useRequestProtocol';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { DEFAULT_ERROR } from '../../graphql/common';
import post from '../../../__tests__/fixture/post';
import type { Comment, PostCommentsData } from '../../graphql/comments';
import { SortCommentsBy } from '../../graphql/comments';
import { generateCommentsQueryKey } from '../../lib/query';

jest.mock('../useRequestProtocol', () => ({
  useRequestProtocol: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  ...(jest.requireActual('../../contexts/AuthContext') as Iterable<unknown>),
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

describe('useMutateComment', () => {
  const displayToast = jest.fn();
  const requestMethod = jest.fn();
  let client: QueryClient;

  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    client = new QueryClient();
    jest.clearAllMocks();

    jest.mocked(useToastNotification).mockReturnValue({
      displayToast,
    } as unknown as ReturnType<typeof useToastNotification>);
    jest.mocked(useAuthContext).mockReturnValue({
      user: { id: 'u1' },
    } as ReturnType<typeof useAuthContext>);
    jest.mocked(useLogContext).mockReturnValue({
      logEvent: jest.fn(),
    } as unknown as ReturnType<typeof useLogContext>);
    jest.mocked(useRequestProtocol).mockReturnValue({
      requestMethod,
      fetchMethod: jest.fn(),
      isCompanion: false,
    });
  });

  it('should toast the server error message when the mutation is rejected', async () => {
    requestMethod.mockRejectedValueOnce({
      response: {
        errors: [
          { message: 'Verify your work email to join tool discussions' },
        ],
      },
    });

    const { result } = renderHook(() => useMutateComment({ post }), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateComment('hello').catch(() => undefined);
    });

    expect(displayToast).toHaveBeenCalledWith(
      'Verify your work email to join tool discussions',
    );
  });

  it('should toast a generic error message when the server sends none', async () => {
    requestMethod.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useMutateComment({ post }), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateComment('hello').catch(() => undefined);
    });

    expect(displayToast).toHaveBeenCalledWith(DEFAULT_ERROR);
  });

  describe('when editing a comment', () => {
    const queryKey = generateCommentsQueryKey({
      postId: post.id,
      sortBy: SortCommentsBy.NewestFirst,
    });
    const createComment = (id: string, children: Comment[] = []) =>
      ({
        id,
        content: id,
        children: {
          edges: children.map((node) => ({ node })),
          pageInfo: null,
        },
      } as unknown as Comment);
    const setComments = (comments: Comment[]) =>
      client.setQueryData<PostCommentsData>(queryKey, {
        postComments: {
          edges: comments.map((node) => ({ node })),
          pageInfo: null,
        },
      } as unknown as PostCommentsData);
    const getComments = () =>
      client.getQueryData<PostCommentsData>(queryKey)?.postComments.edges;

    const editComment = async (
      props: Partial<Parameters<typeof useMutateComment>[0]>,
    ) => {
      requestMethod.mockResolvedValueOnce({
        comment: { id: 'reply', content: 'edited' },
      });
      const { result } = renderHook(
        () => useMutateComment({ post, editCommentId: 'reply', ...props }),
        { wrapper },
      );

      await act(async () => {
        await result.current.mutateComment('edited');
      });
    };

    it('should update a reply even when its parent is not passed', async () => {
      const onCommented = jest.fn();
      setComments([
        createComment('parent', [
          createComment('reply', [createComment('nested')]),
        ]),
      ]);

      await editComment({ onCommented });

      const reply = getComments()?.[0]?.node.children?.edges[0]?.node;
      expect(reply?.content).toEqual('edited');
      expect(reply?.children?.edges[0]?.node.id).toEqual('nested');
      expect(displayToast).not.toHaveBeenCalled();
      expect(onCommented).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'reply' }),
        false,
        undefined,
      );
    });

    it('should refetch a cached list that misses the comment instead of failing', async () => {
      const onCommented = jest.fn();
      setComments([createComment('other')]);
      const invalidateQueries = jest.spyOn(client, 'invalidateQueries');

      await editComment({ onCommented, parentCommentId: 'parent' });

      expect(getComments()?.[0].node.id).toEqual('other');
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey });
      expect(displayToast).not.toHaveBeenCalled();
      expect(onCommented).toHaveBeenCalled();
    });
  });
});
