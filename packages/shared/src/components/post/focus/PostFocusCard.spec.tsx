import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import post, {
  postWithCommunitySentiment,
  sharePost,
} from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { featureCommunitySentiment } from '../../../lib/featureManagement';
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

const renderCard = (
  postToRender: Post,
  options: {
    gb?: GrowthBook;
    onClose?: () => void;
  } = {},
) =>
  render(
    <TestBootProvider client={new QueryClient()} gb={options.gb}>
      <PostFocusCard
        post={postToRender}
        origin={Origin.ArticlePage}
        onClose={options.onClose}
      />
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

describe('PostFocusCard community sentiment', () => {
  it('renders in the post modal when the flag is enabled', () => {
    const gb = new GrowthBook();
    gb.setFeatures({
      [featureCommunitySentiment.id]: {
        defaultValue: true,
      },
    });

    renderCard(postWithCommunitySentiment, { gb, onClose: jest.fn() });

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('stays hidden in the post modal when the flag is disabled', () => {
    renderCard(postWithCommunitySentiment, { onClose: jest.fn() });

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});
