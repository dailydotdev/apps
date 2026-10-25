import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import defaultPost, { sharePost } from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { Post } from '../../../graphql/posts';
import { featureGridCardTldr } from '../../../lib/featureManagement';
import type { PostCardProps } from './common';
import { ArticleGrid } from '../article/ArticleGrid';
import { ShareGrid } from '../share/ShareGrid';
import { gridCardTldrCoverClassName } from './GridCardTldr';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const summary = 'Go 1.27 drains unread HTTP/1 response bodies for you.';
const post: Post = { ...defaultPost, summary };

// jsdom does no layout, so a clamped paragraph never reports overflow on its own.
const mockTextHeights = (scrollHeight: number, clientHeight: number) => {
  jest
    .spyOn(Element.prototype, 'scrollHeight', 'get')
    .mockReturnValue(scrollHeight);
  jest
    .spyOn(Element.prototype, 'clientHeight', 'get')
    .mockReturnValue(clientHeight);
};

const props = (overrides: Partial<PostCardProps> = {}): PostCardProps => ({
  post,
  onPostClick: jest.fn(),
  onPostAuxClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
  onTldrExpand: jest.fn(),
  ...overrides,
});

const renderCard = (
  cardProps: PostCardProps,
  isEnabled = true,
  Card: typeof ArticleGrid = ArticleGrid,
) => {
  const gb = new GrowthBook();
  gb.setFeatures({ [featureGridCardTldr.id]: { defaultValue: isEnabled } });

  return render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <Card {...cardProps} />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  jest.restoreAllMocks();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
});

describe('grid card TLDR', () => {
  it('keeps the card as it is in the control arm', () => {
    renderCard(props(), false);

    expect(screen.queryByText(summary)).not.toBeInTheDocument();
    expect(screen.getByAltText('Post Cover image')).not.toHaveClass(
      gridCardTldrCoverClassName,
    );
  });

  it('shows the clamped TLDR over a shorter cover', () => {
    mockTextHeights(120, 40);
    renderCard(props());

    expect(screen.getByText(summary)).toHaveClass('line-clamp-2');
    expect(screen.getByRole('button', { name: 'Show more' })).toBeVisible();
    expect(screen.getByAltText('Post Cover image')).toHaveClass(
      gridCardTldrCoverClassName,
    );
  });

  it('expands in place of the cover, then opens the post on a tap', () => {
    mockTextHeights(120, 40);
    const cardProps = props();
    renderCard(cardProps);

    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));

    expect(cardProps.onTldrExpand).toHaveBeenCalledTimes(1);
    expect(cardProps.onTldrExpand).toHaveBeenCalledWith(post);
    expect(screen.getByText(summary)).not.toHaveClass('line-clamp-2');
    expect(screen.queryByAltText('Post Cover image')).not.toBeInTheDocument();
    expect(cardProps.onPostClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(summary));
    expect(cardProps.onPostClick).toHaveBeenCalledWith(post);
  });

  it("shows a share's TLDR from the post it shares", () => {
    renderCard(props({ post: sharePost }), true, ShareGrid);

    expect(
      screen.getByText(sharePost.sharedPost?.summary?.trim() as string),
    ).toBeInTheDocument();
  });
});
