import type { ReactElement } from 'react';
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Post } from '../../../graphql/posts';
import { PostInsightPanel } from './PostInsightPanel';

jest.mock('../tags/PostTagList', () => ({
  PostTagList: ({ post }: { post: Post }): ReactElement => (
    <div data-testid="post-tag-list">{post.tags?.join(',') || 'no-tags'}</div>
  ),
}));

jest.mock('../../widgets/PostToc', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="post-toc" />,
}));

const basePost = {
  id: 'p1',
  readTime: 5,
  numUpvotes: 42,
  numComments: 7,
  tags: ['react', 'typescript'],
} as Post;

describe('PostInsightPanel', () => {
  it('promotes summary, topics, and engagement stats', () => {
    render(
      <PostInsightPanel
        post={{
          ...basePost,
          summary: 'A concise summary of the post.',
          toc: [{ text: 'Intro', id: 'intro' }],
        }}
      />,
    );

    expect(screen.getByText('In 30 seconds')).toBeInTheDocument();
    expect(
      screen.getByText('A concise summary of the post.'),
    ).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('7 comments')).toBeInTheDocument();
    expect(screen.getByTestId('post-tag-list')).toHaveTextContent(
      'react,typescript',
    );
    expect(screen.getByTestId('post-toc')).toBeInTheDocument();
  });

  it('renders useful fallback copy when summary and tags are missing', () => {
    render(
      <PostInsightPanel
        post={{
          ...basePost,
          summary: undefined,
          tags: [],
          toc: [],
        }}
      />,
    );

    expect(
      screen.getByText(
        'Explore the post, then use the developer context below to find related discussions, tools, and stories.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('post-tag-list')).toHaveTextContent('no-tags');
  });
});
