import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostCardHeader } from './PostCardHeader';
import { FeedCardContext } from '../../../../features/posts/FeedCardContext';
import type { Post } from '../../../../graphql/posts';
import { PostType } from '../../../../graphql/posts';
import { SourceType } from '../../../../graphql/sources';

jest.mock('../../../../hooks', () => ({
  ...jest.requireActual('../../../../hooks'),
  useFeedPreviewMode: () => false,
  useBookmarkProvider: () => ({ highlightBookmarkedPost: false }),
}));

const author = {
  id: 'u1',
  name: 'Ada Lovelace',
  username: 'ada',
  image: 'https://daily.dev/ada.jpg',
  permalink: 'https://daily.dev/ada',
};

const source = {
  id: 'wc',
  handle: 'watercooler',
  name: 'Watercooler',
  image: 'https://daily.dev/wc.jpg',
  permalink: 'https://daily.dev/squads/watercooler',
  type: SourceType.Squad,
  public: true,
};

const createPost = (props: Partial<Post> = {}): Post =>
  ({
    id: 'p1',
    title: 'A post',
    type: PostType.Freeform,
    createdAt: '2026-08-01T10:00:00.000Z',
    source,
    author,
    ...props,
  } as Post);

const renderHeader = (post: Post, hideSource: boolean) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <FeedCardContext.Provider value={{ hideSource }}>
        <PostCardHeader
          post={post}
          metadata={{ topLabel: source.name, bottomLabel: `@${source.handle}` }}
        />
      </FeedCardContext.Provider>
    </QueryClientProvider>,
  );

describe('list PostCardHeader', () => {
  it('labels the card with the source by default', () => {
    renderHeader(createPost(), false);

    expect(screen.getByText(source.name)).toBeInTheDocument();
    expect(screen.queryByText(author.name)).not.toBeInTheDocument();
  });

  it('swaps in the author when the feed hides the source', () => {
    renderHeader(createPost(), true);

    expect(screen.getByText(author.name)).toBeInTheDocument();
    expect(screen.getByText(`@${author.username}`)).toBeInTheDocument();
    expect(screen.queryByText(source.name)).not.toBeInTheDocument();
  });

  it('keeps the source label when there is no author to replace it', () => {
    renderHeader(createPost({ author: undefined }), true);

    expect(screen.getByText(source.name)).toBeInTheDocument();
  });
});
