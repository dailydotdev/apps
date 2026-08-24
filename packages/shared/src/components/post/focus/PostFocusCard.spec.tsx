import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import post, { sharePost } from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { PostFocusCard } from './PostFocusCard';

const freeformPost: Post = {
  ...post,
  id: 'freeform-post-id',
  type: PostType.Freeform,
  contentHtml: '<p>Freeform body</p>',
};

const sharedFreeformPost: Post = {
  ...sharePost,
  id: 'shared-freeform-id',
  sharedPost: {
    ...sharePost.sharedPost,
    type: PostType.Freeform,
  },
} as Post;

const renderCard = (postToRender: Post) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <PostFocusCard post={postToRender} origin={Origin.ArticlePage} />
    </TestBootProvider>,
  );

describe('PostFocusCard opening the source article', () => {
  it('links the cover to the source article on an external post', () => {
    renderCard(post);

    const cover = screen.getByTestId('post-cover-link');
    expect(cover).toHaveAttribute('href', post.permalink);
    expect(cover).toHaveAttribute('target', '_blank');
    expect(cover).toHaveAttribute('aria-hidden', 'true');
    expect(cover).toHaveAttribute('tabindex', '-1');
    expect(screen.queryByLabelText('View cover image')).not.toBeInTheDocument();
  });

  it('links the cover to the shared article on a share post', () => {
    renderCard(sharePost);

    expect(screen.getByTestId('post-cover-link')).toHaveAttribute(
      'href',
      sharePost.sharedPost?.permalink,
    );
  });

  it('links the title to the source article on an external post', () => {
    renderCard(post);

    const title = screen.getByTestId('post-modal-title');
    expect(title.querySelector('a')).toHaveAttribute('href', post.permalink);
  });

  it('keeps the lightbox when a share wraps a native post', () => {
    renderCard(sharedFreeformPost);

    expect(screen.queryByTestId('post-cover-link')).not.toBeInTheDocument();
    expect(screen.getByLabelText('View cover image')).toBeInTheDocument();
    expect(
      screen.getByTestId('post-modal-title').querySelector('a'),
    ).toBeNull();
  });

  it('keeps the lightbox and a plain title on a native post', () => {
    renderCard(freeformPost);

    expect(screen.queryByTestId('post-cover-link')).not.toBeInTheDocument();
    expect(screen.getByLabelText('View cover image')).toBeInTheDocument();
    expect(
      screen.getByTestId('post-modal-title').querySelector('a'),
    ).toBeNull();
  });
});
