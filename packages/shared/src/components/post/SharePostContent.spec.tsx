import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { sharePost } from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import SharePostContent, { CommonSharePostContent } from './SharePostContent';

const mockOpenImage = jest.fn();

jest.mock('../../hooks/useImageViewer', () => ({
  useImageViewer: () => mockOpenImage,
}));

const socialTweetPost: Post = {
  ...sharePost,
  sharedPost: {
    ...sharePost.sharedPost!,
    type: PostType.SocialTwitter,
    title: 'Embedded tweet body',
    image: 'https://pbs.twimg.com/media/embedded-tweet.jpg',
    source: {
      ...sharePost.sharedPost!.source,
      handle: 'dailydotdev',
      name: 'daily.dev',
    } as Post['source'],
  },
};

describe('SharePostContent', () => {
  it('shows shared tweet images on post surfaces', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <SharePostContent
          post={socialTweetPost}
          onReadArticle={jest.fn().mockResolvedValue(undefined)}
        />
      </TestBootProvider>,
    );

    expect(screen.getByAltText('Post cover image')).toHaveAttribute(
      'src',
      socialTweetPost.sharedPost!.image,
    );
  });

  it('opens native repost media without navigating or recording an article read', () => {
    const onReadArticle = jest.fn().mockResolvedValue(undefined);
    const sharedPost = { ...sharePost.sharedPost!, type: PostType.Freeform };
    render(
      <TestBootProvider client={new QueryClient()}>
        <CommonSharePostContent
          sharedPost={sharedPost}
          source={sharePost.source}
          onReadArticle={onReadArticle}
        />
      </TestBootProvider>,
    );

    const image = screen.getByAltText('Post cover image');
    expect(image.closest('a')).toBeNull();
    fireEvent.click(image);

    expect(mockOpenImage).toHaveBeenCalledWith(
      sharedPost.image,
      'Post cover image',
      expect.any(Element),
    );
    expect(onReadArticle).not.toHaveBeenCalled();
  });

  it('keeps shared tweet images hidden without the explicit opt-in', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <CommonSharePostContent
          sharedPost={socialTweetPost.sharedPost}
          source={socialTweetPost.source}
          onReadArticle={jest.fn().mockResolvedValue(undefined)}
        />
      </TestBootProvider>,
    );

    expect(screen.queryByAltText('Post cover image')).not.toBeInTheDocument();
  });
});
