import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockDesktop, mockMatchMedia } from '../../../__tests__/helpers/media';
import { postWithCommunitySentiment } from '../../../__tests__/fixture/post';
import { Origin } from '../../lib/log';
import { PostContentRaw } from './PostContent';

const renderContent = (post = postWithCommunitySentiment) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <PostContentRaw
        post={post}
        origin={Origin.ArticleModal}
        onClose={jest.fn()}
      />
    </TestBootProvider>,
  );

const QUOTE =
  'They optimised the product they had instead of the one their customers were moving to.';

const renderPostPage = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <PostContentRaw
        post={{ ...postWithCommunitySentiment, summary: QUOTE }}
        origin={Origin.ArticlePage}
        isPostPage
      />
    </TestBootProvider>,
  );

/** Anonymous visitors get in-content ads, and then the page renders the
    summary itself through this prop rather than PostContent's own paragraph. */
const renderWithAdSegments = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <PostContentRaw
        post={{ ...postWithCommunitySentiment, summary: QUOTE }}
        origin={Origin.ArticlePage}
        isPostPage
        renderSummarySegments={(summary) => <p>{summary}</p>}
      />
    </TestBootProvider>,
  );

/** No isPostPage: that is the post modal, the overlay opened from a feed. */
const renderModal = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <PostContentRaw
        post={{ ...postWithCommunitySentiment, summary: QUOTE }}
        origin={Origin.ArticleModal}
        onClose={jest.fn()}
      />
    </TestBootProvider>,
  );

const selectTheSummary = () => {
  const node = screen.getByTestId('tldr-container').firstChild as Node;
  const range = document.createRange();
  range.setStart(node, 0);
  range.setEnd(node, node.textContent?.length ?? 0);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  // The reader letting go of the drag is what commits the quote.
  fireEvent.pointerUp(document);
};

describe('PostContent community sentiment', () => {
  it('renders in the classic post modal when the post has a take', () => {
    renderContent();

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('stays hidden in the classic post modal when the post has no take', () => {
    renderContent({ ...postWithCommunitySentiment, communitySentiment: null });

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});

it('keeps the article cover linked to the read destination', () => {
  renderContent();

  expect(screen.getByAltText('Post cover image').closest('a')).toHaveAttribute(
    'href',
    postWithCommunitySentiment.permalink,
  );
  expect(
    screen.queryByRole('button', { name: 'Open image' }),
  ).not.toBeInTheDocument();
});

describe('PostContent selection snapshot', () => {
  beforeAll(() => {
    // jsdom has no layout, and the bar refuses a selection it cannot place.
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
  });

  it('offers a snapshot of a quote on the post page', () => {
    renderPostPage();

    selectTheSummary();

    expect(
      screen.getByRole('toolbar', { name: 'Share selected text' }),
    ).toBeInTheDocument();
  });
});

describe('PostContent summary snapshot', () => {
  it('runs the icon into the end of the TLDR', () => {
    renderPostPage();

    expect(screen.getByLabelText('Snapshot')).toBeInTheDocument();
    // It has to live inside the paragraph, not under it.
    expect(screen.getByTestId('tldr-container')).toContainElement(
      screen.getByLabelText('Snapshot'),
    );
  });

  it('runs the icon into the end of the TLDR in the classic modal', () => {
    renderModal();

    expect(screen.getByTestId('tldr-container')).toContainElement(
      screen.getByLabelText('Snapshot'),
    );
  });
});

describe('PostContent summary snapshot with in-content ads', () => {
  it('still offers the summary when the page renders it in segments', () => {
    renderWithAdSegments();

    expect(screen.getByLabelText('Snapshot')).toBeInTheDocument();
  });
});

describe('PostContent selection snapshot in the post modal', () => {
  beforeAll(() => {
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
  });

  it('offers a snapshot of a quote selected in the modal', () => {
    renderModal();

    selectTheSummary();

    expect(
      screen.getByRole('toolbar', { name: 'Share selected text' }),
    ).toBeInTheDocument();
  });
});

// `post_page_feed` puts an endless feed in `belowComments`. Below laptop the
// rail stacks under the main column, so it has to come before the feed or
// nobody scrolls to it (its direct ad stopped being seen on phones).
describe('rail with a feed below the comments', () => {
  const renderWithFeed = () =>
    render(
      <TestBootProvider client={new QueryClient()}>
        <PostContentRaw
          post={postWithCommunitySentiment}
          origin={Origin.ArticlePage}
          isPostPage
          belowComments={<div data-testid="feedSlot" />}
        />
      </TestBootProvider>,
    );

  const railAndFeed = () => {
    const container = screen.getByTestId('postContainer');
    const rail = document.querySelector('aside') as HTMLElement;
    const feed = screen.getByTestId('feedSlot');

    return { container, rail, feed };
  };

  afterEach(() => {
    mockMatchMedia();
  });

  it('puts the rail between the comments and the feed below laptop', async () => {
    mockMatchMedia(() => false);
    renderWithFeed();

    await waitFor(() => {
      const { container, rail } = railAndFeed();
      expect(container).toContainElement(rail);
    });
    const { rail, feed } = railAndFeed();
    expect(
      // eslint-disable-next-line no-bitwise
      rail.compareDocumentPosition(feed) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(document.querySelectorAll('aside')).toHaveLength(1);
  });

  it('keeps the rail beside the post on laptop', async () => {
    mockDesktop();
    renderWithFeed();

    await waitFor(() => expect(document.querySelector('aside')).toBeTruthy());
    const { container, rail } = railAndFeed();
    expect(container).not.toContainElement(rail);
    expect(document.querySelectorAll('aside')).toHaveLength(1);
  });

  it('keeps the rail in place below laptop when there is no feed', async () => {
    mockMatchMedia(() => false);
    renderPostPage();

    await waitFor(() => expect(document.querySelector('aside')).toBeTruthy());
    expect(screen.getByTestId('postContainer')).not.toContainElement(
      document.querySelector('aside') as HTMLElement,
    );
  });
});
