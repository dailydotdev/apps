import React from 'react';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useOnPostClick from './useOnPostClick';
import type { Post } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import { SharedFeedPage } from '../components/utilities/common';

jest.mock('../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('./streaks', () => ({
  useReadingStreak: () => ({ checkReadingStreak: jest.fn() }),
}));

jest.mock('./useFeedLayout', () => ({
  ...jest.requireActual('./useFeedLayout'),
  useFeedLayout: () => ({ shouldUseListFeedLayout: true }),
}));

const post = { id: 'p1', type: PostType.Article, read: false } as Post;

describe('useOnPostClick', () => {
  it('reads a post from a page whose cached feeds never loaded', async () => {
    const client = new QueryClient();
    // A feed query that is in the cache without data, as one that failed or
    // was never fetched is.
    client.getQueryCache().build(client, {
      queryKey: [SharedFeedPage.Popular, 'u1'],
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useOnPostClick({}), { wrapper });

    await expect(result.current({ post })).resolves.toBeUndefined();
  });
});
