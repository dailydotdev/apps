import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import post from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
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
