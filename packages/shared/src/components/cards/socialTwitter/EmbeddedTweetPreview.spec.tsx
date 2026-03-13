import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { sharePost } from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { EmbeddedTweetPreview } from './EmbeddedTweetPreview';

const basePost: Post = {
  ...sharePost,
  type: PostType.SocialTwitter,
  title: 'Root tweet',
  image: 'https://pbs.twimg.com/media/tweet.jpg',
  sharedPost: undefined,
};

describe('EmbeddedTweetPreview', () => {
  it('always renders identity in ltr direction', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <EmbeddedTweetPreview
          post={{
            ...basePost,
            title: 'Noojaan Farahmand (@noojaanf): Some tweet text',
            language: 'fa',
          }}
          textClampClass=""
        />
      </TestBootProvider>,
    );

    expect(
      screen.getByText('Noojaan Farahmand @noojaanf'),
    ).toHaveAttribute('dir', 'ltr');
  });

  it('can clip tweet text inside the remaining container height', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <EmbeddedTweetPreview
          post={basePost}
          textClampClass="overflow-hidden"
          fillAvailableHeight
        />
      </TestBootProvider>,
    );

    expect(screen.getByText('Root tweet')).toHaveClass(
      'min-h-0',
      'overflow-hidden',
    );
  });
});
