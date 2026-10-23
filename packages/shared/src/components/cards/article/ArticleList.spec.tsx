import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import post from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import { PostType } from '../../../graphql/posts';
import { featureListCardTldr } from '../../../lib/featureManagement';
import { ArticleList } from './ArticleList';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const renderCard = (isNarrow?: boolean) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ArticleList post={post} isNarrow={isNarrow} />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockDesktop();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
});

describe('ArticleList in a narrow column', () => {
  it('stacks the cover under the title', () => {
    renderCard(true);

    // Found by alt text: the testid sits on the wrapper, not on the image.
    const cover = screen.getByAltText('Post Cover image');

    expect(cover).toHaveClass('!w-full');
    expect(cover).toHaveClass('self-stretch');
  });

  it('drops the gutter that separated the title from the cover beside it', () => {
    renderCard(true);

    expect(screen.getByText(post.title as string).closest('.mr-4')).toBeNull();
  });

  it('leaves the wide card exactly as it was', () => {
    renderCard();

    const cover = screen.getByAltText('Post Cover image');

    expect(cover).not.toHaveClass('!w-full');
    expect(
      screen.getByText(post.title as string).closest('.mr-4'),
    ).not.toBeNull();
  });
});

describe('ArticleList TLDR experiment', () => {
  it('shows the TLDR on YouTube cards', () => {
    const gb = new GrowthBook();
    gb.setFeatures({ [featureListCardTldr.id]: { defaultValue: true } });
    const summary = 'A walkthrough of what changed in the release.';

    render(
      <TestBootProvider client={new QueryClient()} gb={gb}>
        <ArticleList post={{ ...post, type: PostType.VideoYouTube, summary }} />
      </TestBootProvider>,
    );

    expect(screen.getByText(summary)).toBeInTheDocument();
  });
});
