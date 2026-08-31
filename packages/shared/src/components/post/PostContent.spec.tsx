import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment } from '../../../__tests__/fixture/post';
import { Origin } from '../../lib/log';
import {
  featureCommunitySentiment,
  featureSnapshotSelectionShare,
} from '../../lib/featureManagement';
import { PostContentRaw } from './PostContent';

const renderContent = (gb?: GrowthBook) =>
  render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <PostContentRaw
        post={postWithCommunitySentiment}
        origin={Origin.ArticleModal}
        onClose={jest.fn()}
      />
    </TestBootProvider>,
  );

const QUOTE =
  'They optimised the product they had instead of the one their customers were moving to.';

const renderPostPage = (gb?: GrowthBook) =>
  render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <PostContentRaw
        post={{ ...postWithCommunitySentiment, summary: QUOTE }}
        origin={Origin.ArticlePage}
        isPostPage
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

const snapshotFlagOn = () => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureSnapshotSelectionShare.id]: { defaultValue: true },
  });

  return gb;
};

describe('PostContent community sentiment', () => {
  it('renders in the classic post modal when the flag is enabled', () => {
    const gb = new GrowthBook();
    gb.setFeatures({
      [featureCommunitySentiment.id]: {
        defaultValue: true,
      },
    });

    renderContent(gb);

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('stays hidden in the classic post modal when the flag is disabled', () => {
    renderContent();

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});

describe('PostContent selection snapshot', () => {
  beforeAll(() => {
    // jsdom has no layout, and the bar refuses a selection it cannot place.
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
  });

  it('offers a snapshot of a quote on the post page when the flag is enabled', () => {
    renderPostPage(snapshotFlagOn());

    selectTheSummary();

    expect(
      screen.getByRole('toolbar', { name: 'Share selected text' }),
    ).toBeInTheDocument();
  });

  it('stays out of the way when the flag is disabled', () => {
    renderPostPage();

    selectTheSummary();

    expect(
      screen.queryByRole('toolbar', { name: 'Share selected text' }),
    ).not.toBeInTheDocument();
  });
});
