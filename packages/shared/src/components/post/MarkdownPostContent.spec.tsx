import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import post from '../../../__tests__/fixture/post';
import { PostType } from '../../graphql/posts';
import MarkdownPostContent from './MarkdownPostContent';

const mockOpenImage = jest.fn();

jest.mock('../../hooks/useImageViewer', () => ({
  useImageViewer: () => mockOpenImage,
}));

it.each([true, false])(
  'uses the same viewer for freeform cover and body images with compact spacing %s',
  (isCompactSpacing) => {
    const image = 'https://media.daily.dev/cover.png';
    const bodyImage = 'https://media.daily.dev/body.png';
    render(
      <TestBootProvider client={new QueryClient()}>
        <MarkdownPostContent
          post={{
            ...post,
            type: PostType.Freeform,
            image,
            contentHtml: `<p><img src="${bodyImage}" alt="A screenshot" /></p>`,
          }}
          isCompactSpacing={isCompactSpacing}
        />
      </TestBootProvider>,
    );

    const cover = screen.getByAltText('Post cover image');
    expect(cover.closest('a')).toBeNull();
    fireEvent.click(cover);
    expect(mockOpenImage).toHaveBeenLastCalledWith(
      image,
      'Post cover image',
      expect.any(Element),
    );

    fireEvent.click(screen.getByAltText('A screenshot'));
    expect(mockOpenImage).toHaveBeenLastCalledWith(
      bodyImage,
      'A screenshot',
      expect.any(Element),
    );
  },
);
