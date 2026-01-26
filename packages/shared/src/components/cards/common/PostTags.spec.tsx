import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import PostTags from './PostTags';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';

jest.mock('../../../hooks', () => {
  const originalModule = jest.requireActual('../../../hooks');
  return {
    __esModule: true,
    ...originalModule,
    useFeedLayout: () => ({
      isListMode: false,
    }),
  };
});

const renderComponent = (
  props: { post: { tags: string[] }; className?: string } = {
    post: { tags: ['react', 'javascript'] },
  },
): RenderResult => {
  return render(
    <TestBootProvider client={new QueryClient()}>
      <PostTags {...props} />
    </TestBootProvider>,
  );
};

describe('PostTags', () => {
  it('should not have flex-1 class to prevent vertical clipping', () => {
    const { container } = renderComponent();
    const tagsContainer = container.firstChild as HTMLElement;

    expect(tagsContainer).not.toHaveClass('flex-1');
  });

  it('should have overflow-hidden class', () => {
    const { container } = renderComponent();
    const tagsContainer = container.firstChild as HTMLElement;

    expect(tagsContainer).toHaveClass('overflow-hidden');
  });

  it('should render with correct base classes', () => {
    const { container } = renderComponent();
    const tagsContainer = container.firstChild as HTMLElement;

    expect(tagsContainer).toHaveClass('flex');
    expect(tagsContainer).toHaveClass('w-full');
    expect(tagsContainer).toHaveClass('min-w-0');
    expect(tagsContainer).toHaveClass('items-center');
    expect(tagsContainer).toHaveClass('gap-2');
  });
});
