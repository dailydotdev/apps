import { act, renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { usePostModalNavigation } from './usePostModalNavigation';
import type { FeedItem, UpdateFeedPost } from './useFeed';
import type { Post } from '../graphql/posts';
import { PostType } from '../graphql/posts';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: jest.fn(() => ({
    logEvent: jest.fn(),
  })),
}));

jest.mock('./useKeyboardNavigation', () => ({
  useKeyboardNavigation: jest.fn(),
}));

const createPostItem = (id: string, index: number): FeedItem =>
  ({
    type: 'post',
    post: {
      id,
      slug: id,
      type: PostType.Article,
    } as Post,
    page: 1,
    index,
  } as FeedItem);

describe('usePostModalNavigation', () => {
  let mockRouter: Partial<NextRouter> & {
    push: jest.Mock;
    replace: jest.Mock;
  };
  let updatePost: jest.MockedFunction<UpdateFeedPost>;

  const items = [createPostItem('post-1', 0), createPostItem('post-2', 1)];

  beforeEach(() => {
    mockRouter = {
      query: {},
      pathname: '/feed',
      asPath: '/feed?sort=top',
      push: jest.fn().mockResolvedValue(true),
      replace: jest.fn().mockResolvedValue(true),
    };
    updatePost = jest.fn();

    mocked(useRouter).mockReturnValue(mockRouter as NextRouter);
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 240,
      writable: true,
    });
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls router.push with the router instance bound on initial open', async () => {
    const push = jest.fn(function pushMethod() {
      expect(this).toBe(mockRouter);
      return Promise.resolve(true);
    });
    mockRouter.push = push;

    const { result } = renderHook(() =>
      usePostModalNavigation({
        items,
        fetchPage: jest.fn(),
        updatePost,
        canFetchMore: true,
        feedName: 'main',
      }),
    );

    act(() => {
      result.current.onOpenModal(0);
    });

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
  });

  it('calls router.replace with the router instance bound for next post navigation', async () => {
    const replace = jest.fn(function replaceMethod() {
      expect(this).toBe(mockRouter);
      return Promise.resolve(true);
    });
    mockRouter.query = {
      pmid: 'post-1',
      pmp: '/feed',
      pmap: '/feed?sort=top',
      pmcid: 'main',
    };
    mockRouter.replace = replace;

    const { result } = renderHook(() =>
      usePostModalNavigation({
        items,
        fetchPage: jest.fn(),
        updatePost,
        canFetchMore: true,
        feedName: 'main',
      }),
    );

    await act(async () => {
      await result.current.onNext();
    });

    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('uses push for the initial modal open', async () => {
    const { result } = renderHook(() =>
      usePostModalNavigation({
        items,
        fetchPage: jest.fn(),
        updatePost,
        canFetchMore: true,
        feedName: 'main',
      }),
    );

    act(() => {
      result.current.onOpenModal(0);
    });

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledTimes(1));
    expect(mockRouter.replace).not.toHaveBeenCalled();

    const [url, as, options] = mockRouter.push.mock.calls[0];
    const parsedUrl = new URL(url, 'https://app.daily.dev');

    expect(parsedUrl.pathname).toBe('/feed');
    expect(parsedUrl.searchParams.get('pmid')).toBe('post-1');
    expect(parsedUrl.searchParams.get('pmp')).toBe('/feed');
    expect(parsedUrl.searchParams.get('pmap')).toBe('/feed?sort=top');
    expect(parsedUrl.searchParams.get('pmcid')).toBe('main');
    expect(as).toBe('/posts/post-1');
    expect(options).toEqual({ scroll: false });
  });

  it('uses replace when navigating between posts in the modal', async () => {
    mockRouter.query = {
      pmid: 'post-1',
      pmp: '/feed',
      pmap: '/feed?sort=top',
      pmcid: 'main',
    };

    const { result } = renderHook(() =>
      usePostModalNavigation({
        items,
        fetchPage: jest.fn(),
        updatePost,
        canFetchMore: true,
        feedName: 'main',
      }),
    );

    await act(async () => {
      await result.current.onNext();
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledTimes(1);

    const [url, as, options] = mockRouter.replace.mock.calls[0];
    const parsedUrl = new URL(url, 'https://app.daily.dev');

    expect(parsedUrl.searchParams.get('pmid')).toBe('post-2');
    expect(parsedUrl.searchParams.get('pmp')).toBe('/feed');
    expect(parsedUrl.searchParams.get('pmap')).toBe('/feed?sort=top');
    expect(parsedUrl.searchParams.get('pmcid')).toBe('main');
    expect(as).toBe('/posts/post-2');
    expect(options).toEqual({ scroll: false });
  });

  it('uses replace to close the modal and restores the saved scroll position', async () => {
    const { result } = renderHook(() =>
      usePostModalNavigation({
        items,
        fetchPage: jest.fn(),
        updatePost,
        canFetchMore: true,
        feedName: 'main',
      }),
    );

    act(() => {
      result.current.onOpenModal(0);
    });

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledTimes(1));

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 10,
      writable: true,
    });

    await act(async () => {
      await result.current.onCloseModal();
    });

    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/feed?sort=top',
      '/feed?sort=top',
      { scroll: false },
    );
    expect(window.scrollTo).toHaveBeenCalledWith(0, 240);
  });
});
