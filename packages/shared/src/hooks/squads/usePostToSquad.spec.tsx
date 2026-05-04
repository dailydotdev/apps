import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { usePostToSquad } from './usePostToSquad';
import { submitExternalLink } from '../../graphql/posts';
import { addPostToSquad } from '../../graphql/squads';
import { useToastNotification } from '../useToastNotification';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { useRequestProtocol } from '../useRequestProtocol';
import useSourcePostModeration from '../source/useSourcePostModeration';
import useNotificationSettings from '../notifications/useNotificationSettings';

jest.mock('../../graphql/posts', () => ({
  ...(jest.requireActual('../../graphql/posts') as Iterable<unknown>),
  submitExternalLink: jest.fn(),
}));

jest.mock('../../graphql/squads', () => ({
  ...(jest.requireActual('../../graphql/squads') as Iterable<unknown>),
  addPostToSquad: jest.fn(),
}));

jest.mock('../useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  ...(jest.requireActual('../../contexts/AuthContext') as Iterable<unknown>),
  useAuthContext: jest.fn(),
}));

jest.mock('../useActions', () => ({
  useActions: jest.fn(),
}));

jest.mock('../useRequestProtocol', () => ({
  useRequestProtocol: jest.fn(),
}));

jest.mock('../source/useSourcePostModeration', () => jest.fn());

jest.mock('../notifications/useNotificationSettings', () => jest.fn());

describe('usePostToSquad', () => {
  const displayToast = jest.fn();
  const completeAction = jest.fn();
  const requestMethod = jest.fn();
  const onComplete = jest.fn();
  const onPostSuccess = jest.fn();
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
      user: { id: 'user-1' },
    } as ReturnType<typeof useAuthContext>);
    jest.mocked(useActions).mockReturnValue({
      completeAction,
    } as unknown as ReturnType<typeof useActions>);
    jest.mocked(useRequestProtocol).mockReturnValue({
      requestMethod,
    } as unknown as ReturnType<typeof useRequestProtocol>);
    jest.mocked(useSourcePostModeration).mockReturnValue({
      onCreatePostModeration: jest.fn(),
      isSuccess: false,
      isPending: false,
    } as unknown as ReturnType<typeof useSourcePostModeration>);
    jest.mocked(useNotificationSettings).mockReturnValue({
      toggleGroup: jest.fn(),
      getGroupStatus: jest.fn(() => true),
    } as unknown as ReturnType<typeof useNotificationSettings>);
    jest.mocked(addPostToSquad).mockReturnValue(jest.fn());
  });

  it('fires onComplete after submitting an external link without a preview id', async () => {
    jest.mocked(submitExternalLink).mockResolvedValue({} as never);

    const { result } = renderHook(
      () =>
        usePostToSquad({
          initialPreview: {
            url: 'https://daily.dev/post',
            finalUrl: 'https://daily.dev/post',
            title: 'Daily',
            image: 'https://daily.dev/post.png',
          },
          onComplete,
          onPostSuccess,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.onSubmitPost(
        { preventDefault: jest.fn() } as never,
        { id: 'squad-1', moderationRequired: false } as never,
        'Nice post',
      );
    });

    expect(submitExternalLink).toHaveBeenCalledWith(
      {
        commentary: 'Nice post',
        image: 'https://daily.dev/post.png',
        sourceId: 'squad-1',
        title: 'Daily',
        url: 'https://daily.dev/post',
      },
      requestMethod,
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onPostSuccess).not.toHaveBeenCalled();
  });

  it('fires onComplete alongside onPostSuccess for shared post submissions', async () => {
    const mutatePost = jest.fn().mockResolvedValue({
      id: 'post-1',
      permalink: 'https://daily.dev/posts/1',
    });
    jest.mocked(addPostToSquad).mockReturnValue(mutatePost);

    const { result } = renderHook(
      () =>
        usePostToSquad({
          initialPreview: {
            id: 'shared-1',
            permalink: 'https://daily.dev/shared/1',
          },
          onComplete,
          onPostSuccess,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.onSubmitPost(
        { preventDefault: jest.fn() } as never,
        { id: 'squad-1', moderationRequired: false } as never,
        'Commentary',
      );
    });

    expect(mutatePost).toHaveBeenCalledWith({
      commentary: 'Commentary',
      id: 'shared-1',
      sourceId: 'squad-1',
    });
    expect(onPostSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'post-1',
        permalink: 'https://daily.dev/posts/1',
      }),
      'https://daily.dev/posts/1',
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
