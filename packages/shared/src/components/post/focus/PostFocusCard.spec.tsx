import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import post, {
  postWithCommunitySentiment,
  sharePost,
} from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import {
  featureCommunitySentiment,
  featurePostCopySummary,
  featureSnapshotSelectionShare,
} from '../../../lib/featureManagement';
import { getPostByIdKey } from '../../../lib/query';
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
    client?: QueryClient;
  } = {},
) =>
  render(
    <TestBootProvider
      client={options.client ?? new QueryClient()}
      gb={options.gb}
    >
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

  it('hydrates the take from the post-by-id cache when the feed post omits it', () => {
    const gb = new GrowthBook();
    gb.setFeatures({
      [featureCommunitySentiment.id]: {
        defaultValue: true,
      },
    });
    // Feed payloads omit `communitySentiment`, so the modal must read the
    // hydrated post from the post-by-id cache instead of the feed prop.
    const client = new QueryClient();
    client.setQueryData(getPostByIdKey(postWithCommunitySentiment.id), {
      post: postWithCommunitySentiment,
    });
    const feedPost: Post = {
      ...postWithCommunitySentiment,
      communitySentiment: undefined,
    };

    renderCard(feedPost, { gb, client, onClose: jest.fn() });

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
  });

  it('stays hidden in the post modal when the flag is disabled', () => {
    renderCard(postWithCommunitySentiment, { onClose: jest.fn() });

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});

/* The redesigned layout is what the post_redesign flag serves, and the share
   placements were wired to the classic one first — these hold that line. */
describe('PostFocusCard share placements', () => {
  const QUOTE =
    'They optimised the product they had instead of the one their customers were moving to.';
  const summaryPost: Post = { ...post, summary: QUOTE };

  const withFlag = (feature: { id: string }) => {
    const gb = new GrowthBook();
    gb.setFeatures({ [feature.id]: { defaultValue: true } });

    return gb;
  };

  beforeAll(() => {
    // jsdom has no layout, and the bar refuses a selection it cannot place.
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
  });

  it('runs copy summary into the end of the TLDR', () => {
    renderCard(summaryPost, { gb: withFlag(featurePostCopySummary) });

    expect(screen.getByTestId('tldr-container')).toContainElement(
      screen.getByLabelText('Copy summary'),
    );
  });

  it('leaves the TLDR alone when copy summary is disabled', () => {
    renderCard(summaryPost);

    expect(screen.queryByLabelText('Copy summary')).not.toBeInTheDocument();
  });

  it('offers a snapshot of a quote selected in the card', () => {
    renderCard(summaryPost, { gb: withFlag(featureSnapshotSelectionShare) });

    const node = screen.getByTestId('tldr-container').firstChild as Node;
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.textContent?.length ?? 0);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    fireEvent.pointerUp(document);

    expect(
      screen.getByRole('toolbar', { name: 'Share selected text' }),
    ).toBeInTheDocument();
  });

  it('keeps the bar away from a selection when the flag is off', () => {
    renderCard(summaryPost);

    const node = screen.getByTestId('tldr-container').firstChild as Node;
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.textContent?.length ?? 0);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    fireEvent.pointerUp(document);

    expect(
      screen.queryByRole('toolbar', { name: 'Share selected text' }),
    ).not.toBeInTheDocument();
  });
});
