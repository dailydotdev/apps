import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import post, { sharePost } from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { PostFocusCard } from './PostFocusCard';

const squadSource = sharePost.source;
if (!squadSource) {
  throw new Error('sharePost fixture must include a squad source');
}

const freeformPost: Post = {
  ...post,
  id: 'freeform-post-id',
  type: PostType.Freeform,
  // Freeform posts live inside a squad; reuse the share fixture's squad.
  source: squadSource,
  contentHtml: '<p>Freeform body</p>',
};

const renderCard = (postToRender: Post) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <PostFocusCard post={postToRender} origin={Origin.ArticlePage} />
    </TestBootProvider>,
  );

describe('PostFocusCard squad attribution', () => {
  it('shows "Posted in {squad}" for a freeform squad post', () => {
    renderCard(freeformPost);

    expect(screen.getByText('Posted in')).toBeInTheDocument();
    const squadLink = screen.getByRole('link', { name: squadSource.name });
    expect(squadLink).toHaveAttribute('href', squadSource.permalink);
  });

  it('shows "Shared via {squad}" for a post shared into a squad', () => {
    renderCard(sharePost);

    expect(screen.getByText('Shared via')).toBeInTheDocument();
    expect(screen.queryByText('Posted in')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: squadSource.name }),
    ).toHaveAttribute('href', squadSource.permalink);
  });

  it('shows no attribution line for a publication article', () => {
    renderCard(post);

    expect(screen.queryByText('Posted in')).not.toBeInTheDocument();
    expect(screen.queryByText('Shared via')).not.toBeInTheDocument();
  });
});
