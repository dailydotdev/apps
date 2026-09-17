import React from 'react';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import {
  POST_BY_ID_QUERY,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import type { PostCommentsData } from '@dailydotdev/shared/src/graphql/comments';
import { POST_COMMENTS_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { createTestSettings } from '@dailydotdev/shared/__tests__/fixture/settings';
import ReadPostPage from '../pages/articles/[id]';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

let mockRedesignOn = false;

jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  __esModule: true,
  useConditionalFeature: (args: {
    feature?: { id?: string; defaultValue?: unknown };
  }) => {
    if (args?.feature?.id === 'post_redesign') {
      return { value: mockRedesignOn, isLoading: false };
    }
    return { value: args?.feature?.defaultValue, isLoading: false };
  },
}));

const postId = '0e4005b2d3cf191f8c44c2718a457a1e';

const post = {
  id: postId,
  title: 'Learn SQL',
  type: PostType.Article,
  permalink: 'http://localhost:4000/r/9CuRpr5NiEY5',
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
  createdAt: '2019-05-16T15:16:05.000Z',
  readTime: 8,
  summary: 'A short summary of the article.',
  tags: ['development', 'sql'],
  source: {
    __typename: 'Source',
    id: 's',
    handle: 's',
    permalink: 'permalink/s',
    name: 'Towards Data Science',
    type: SourceType.Machine,
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
    public: false,
  },
  numUpvotes: 0,
  numComments: 0,
  domain: 'medium.com',
} as Post;

const postMock: MockedGraphQLResponse<PostData> = {
  request: { query: POST_BY_ID_QUERY, variables: { id: postId } },
  result: { data: { post } },
};

const commentsMock: MockedGraphQLResponse<PostCommentsData> = {
  request: { query: POST_COMMENTS_QUERY, variables: { postId, after: '' } },
  result: { data: { postComments: { pageInfo: {}, edges: [] } } },
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mockRedesignOn = false;
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        pathname: '/articles/[id]',
        isReady: true,
        query: { id: postId },
        events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
        beforePopState: jest.fn(),
      } as unknown as NextRouter),
  );
});

const renderPage = (overrides: Partial<Post> = {}) => {
  const page = { ...post, ...overrides };
  mockGraphQL({ ...postMock, result: { data: { post: page } } });
  mockGraphQL(commentsMock);
  return render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: undefined, isLoggedIn: false, isAuthReady: true }}
      settings={createTestSettings()}
    >
      <ReadPostPage id={postId} initialData={{ post: page }} />
    </TestBootProvider>,
  );
};

describe('ReadPostPage under post_redesign', () => {
  it('keeps the classic read template when the flag is off', async () => {
    renderPage();
    expect(await screen.findByTestId('postContainer')).toBeInTheDocument();
    expect(screen.queryByTestId('post-focus-card')).not.toBeInTheDocument();
  });

  it('renders the focus card when the flag is on, without a direct-sold widget', async () => {
    mockRedesignOn = true;
    renderPage();
    expect(await screen.findByTestId('post-focus-card')).toBeInTheDocument();
    expect(screen.queryByTestId('postContainer')).not.toBeInTheDocument();
    expect(screen.queryByText(/Promoted by/)).not.toBeInTheDocument();
  });

  it('keeps the first body unit on phones when the card shows a body, not a summary', async () => {
    mockRedesignOn = true;
    // Units mount their slot node only once they intersect; the suite-wide
    // observer mock never fires.
    const originalObserver = global.IntersectionObserver;
    global.IntersectionObserver = class {
      constructor(private callback: IntersectionObserverCallback) {}

      observe = (target: Element): void => {
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      };

      disconnect = jest.fn();

      unobserve = jest.fn();
    } as unknown as typeof IntersectionObserver;
    const paragraph = `<p>${'Body text that runs long enough to split. '.repeat(
      8,
    )}</p>`;
    renderPage({
      type: PostType.Collection,
      contentHtml: paragraph.repeat(3),
      summary:
        'A summary long enough to have split into units on its own. '.repeat(6),
    });
    expect(await screen.findByTestId('post-focus-card')).toBeInTheDocument();

    const bodyUnits = screen.getAllByTestId('ad-slot-17');
    expect(bodyUnits.length).toBeGreaterThan(0);
    expect(bodyUnits[0].parentElement).not.toHaveClass('hidden');
    global.IntersectionObserver = originalObserver;
  });
});
