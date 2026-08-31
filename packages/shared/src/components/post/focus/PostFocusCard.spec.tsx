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
import { getPostByIdKey } from '../../../lib/query';
import { PostFocusCard } from './PostFocusCard';

const freeformPost: Post = {
  ...post,
  id: 'freeform-post-id',
  type: PostType.Freeform,
  contentHtml: '<p>Freeform body</p>',
};

const squadSource = sharePost.source;
if (!squadSource) {
  throw new Error('sharePost fixture must include a squad source');
}

// Freeform posts live inside a squad; reuse the share fixture's squad so the
// "Posted in {squad}" attribution has something to name.
const freeformSquadPost: Post = {
  ...freeformPost,
  id: 'freeform-squad-post-id',
  source: squadSource,
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

describe('PostFocusCard squad attribution', () => {
  it('shows "Posted in {squad}" for a freeform squad post', () => {
    renderCard(freeformSquadPost);

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

describe('PostFocusCard read CTA', () => {
  // Rendered once, repositioned with `flex-col-reverse` — not duplicated
  // behind breakpoint-gated wrappers, so there is exactly one link.
  it('renders a single read CTA pointing at the source article', () => {
    renderCard(post);

    const cta = screen.getAllByRole('link', { name: /Read the full article/ });
    expect(cta).toHaveLength(1);
    expect(cta[0]).toHaveAttribute('href', post.permalink);
    expect(cta[0]).toHaveAttribute('target', '_blank');
  });

  it('does not render a read CTA on a native post', () => {
    renderCard(freeformPost);

    expect(
      screen.queryAllByRole('link', { name: /Read the full article/ }),
    ).toHaveLength(0);
  });
});

describe('PostFocusCard share commentary', () => {
  it("surfaces the sharer's own words above the shared article", () => {
    renderCard(sharePost);

    expect(screen.getByText(sharePost.title as string)).toBeInTheDocument();
  });
});
