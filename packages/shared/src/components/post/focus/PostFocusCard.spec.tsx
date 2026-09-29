import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import post, {
  postWithCommunitySentiment,
  sharePost,
} from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { getPostByIdKey } from '../../../lib/query';
import { PostFocusCard } from './PostFocusCard';

// The real hook needs a boost-eligible author plus a warm post-by-id cache;
// force it on so the tests exercise this card's own gating.
jest.mock('../../../features/boost/useShowBoostButton', () => ({
  useShowBoostButton: jest.fn(() => true),
}));

jest.mock('../../comments/AdAsComment', () => ({
  AdAsComment: () => <div data-testid="ad-as-comment" />,
}));

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

// Reuse the share fixture's squad — the default post fixture has no squad.
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

const sharedTweetPost: Post = {
  ...sharePost,
  id: 'shared-tweet-id',
  title: 'Anyone excited by the new expansion?',
  sharedPost: {
    ...sharePost.sharedPost,
    type: PostType.SocialTwitter,
    title: 'Carve A New Path In A Legendary World.',
    summary: 'A new expansion is set to launch, promising a fresh path.',
    creatorTwitterName: 'World of Warcraft',
    creatorTwitter: 'warcraft',
    domain: 'x.com',
    // Tweets arrive under the unknown placeholder source, so the identity
    // comes from the creator fields.
    source: { ...sharePost.sharedPost?.source, id: 'unknown', name: 'unknown' },
    author: undefined,
  },
} as Post;

const renderCard = (
  postToRender: Post,
  options: {
    onClose?: () => void;
    client?: QueryClient;
  } = {},
) =>
  render(
    <TestBootProvider client={options.client ?? new QueryClient()}>
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

describe('PostFocusCard shared tweet', () => {
  it('renders the tweet as an embedded tweet, not as an article', () => {
    renderCard(sharedTweetPost);

    expect(screen.getByText('World of Warcraft @warcraft')).toBeInTheDocument();
    expect(
      screen.getByText('Carve A New Path In A Legendary World.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('post-modal-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tldr-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('post-cover-link')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Read on/)).not.toBeInTheDocument();
    expect(screen.queryByText('#backend')).not.toBeInTheDocument();
    expect(
      screen.getByText('Anyone excited by the new expansion?'),
    ).toBeInTheDocument();
  });
});

describe('PostFocusCard tags', () => {
  it('lists tags on a publication article', () => {
    renderCard({ ...post, tags: ['backend', 'react'] });

    expect(screen.getByText('#backend')).toBeInTheDocument();
  });

  it('lists no tags on squad posts, like the classic squad template', () => {
    const { unmount } = renderCard({
      ...freeformSquadPost,
      tags: ['backend', 'react'],
    });
    expect(screen.queryByText('#backend')).not.toBeInTheDocument();
    unmount();

    renderCard(sharePost);
    expect(screen.queryByText('#backend')).not.toBeInTheDocument();
  });
});

describe('PostFocusCard shared video', () => {
  it('keeps the embed and summary but no CTA or tags, like the classic share layout', () => {
    renderCard({
      ...sharePost,
      id: 'shared-video-id',
      sharedPost: {
        ...sharePost.sharedPost,
        type: PostType.VideoYouTube,
        videoId: 'abc123',
        summary: 'A short summary of the talk.',
      },
    } as Post);

    expect(
      screen.getByText('A short summary of the talk.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Watch/)).not.toBeInTheDocument();
    expect(screen.queryByText('#backend')).not.toBeInTheDocument();
  });
});

describe('PostFocusCard community sentiment', () => {
  it('renders in the post modal when the post has a take', () => {
    renderCard(postWithCommunitySentiment, { onClose: jest.fn() });

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('hydrates the take from the post-by-id cache when the feed post omits it', () => {
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

    renderCard(feedPost, { client, onClose: jest.fn() });

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
  });

  it('stays hidden in the post modal when the post has no take', () => {
    renderCard(
      { ...postWithCommunitySentiment, communitySentiment: null },
      { onClose: jest.fn() },
    );

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

  beforeAll(() => {
    // jsdom has no layout, and the bar refuses a selection it cannot place.
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
  });

  it('runs the summary snapshot into the end of the TLDR', () => {
    renderCard(summaryPost);

    expect(screen.getByTestId('tldr-container')).toContainElement(
      screen.getByLabelText('Snapshot'),
    );
  });

  it('offers a snapshot of a quote selected in the card', () => {
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
      screen.getByRole('toolbar', { name: 'Share selected text' }),
    ).toBeInTheDocument();
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
  it('renders a single read CTA pointing at the source article', () => {
    renderCard(post);

    const cta = screen.getAllByRole('link', { name: /Read post/ });
    expect(cta).toHaveLength(1);
    expect(cta[0]).toHaveAttribute('href', post.permalink);
    expect(cta[0]).toHaveAttribute('target', '_blank');
  });

  it('does not render a read CTA on a native post', () => {
    renderCard(freeformPost);

    expect(screen.queryAllByRole('link', { name: /Read post/ })).toHaveLength(
      0,
    );
  });
});

describe('PostFocusCard share commentary', () => {
  it("surfaces the sharer's own words above the shared article", () => {
    renderCard(sharePost);

    expect(screen.getByText(sharePost.title as string)).toBeInTheDocument();
  });

  it('keeps the commentary line breaks in body type, not as a title', () => {
    renderCard({
      ...sharePost,
      title: 'Keep calm\n\nWrite accessible code',
      titleHtml: '<p>Keep calm Write accessible code</p>',
    } as Post);

    const commentary = screen.getByText(/Keep calm/);
    expect(commentary).toHaveClass('whitespace-pre-line', 'typo-body');
    expect(commentary).not.toHaveClass('typo-title3');
    expect(commentary).not.toHaveClass('font-bold');
  });
});

describe('PostFocusCard internal comment ad', () => {
  // The post modals pass no ads, so this is what feed readers get there.
  it('renders the internal ad in the thread when no programmatic units are passed', () => {
    renderCard(post, { onClose: jest.fn() });

    expect(screen.getByTestId('ad-as-comment')).toBeInTheDocument();
  });

  it('yields to programmatic comment units', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <PostFocusCard
          post={post}
          origin={Origin.ArticlePage}
          ads={{
            commentAds: { interleaveEvery: 6, renderInterleaved: () => null },
          }}
        />
      </TestBootProvider>,
    );

    expect(screen.queryByTestId('ad-as-comment')).not.toBeInTheDocument();
  });
});

describe('PostFocusCard boost button', () => {
  // The modal's top strip renders PostHeaderActions, which already carries a
  // boost button off the same hook — rendering one here too duplicated it.
  it('is hidden in the modal, where the top strip already has one', () => {
    renderCard(post, { onClose: jest.fn() });

    expect(
      screen.queryByRole('button', { name: 'Boost' }),
    ).not.toBeInTheDocument();
  });

  it('shows on the standalone post page, which has no top strip', () => {
    renderCard(post);

    expect(screen.getByRole('button', { name: 'Boost' })).toBeInTheDocument();
  });
});
