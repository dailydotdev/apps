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

const avatarUser = {
  id: 'user-1',
  image: 'https://pbs.twimg.com/profile_images/user.jpg',
  username: 'dailydotdev',
  name: 'daily.dev',
};

describe('EmbeddedTweetPreview', () => {
  it('always renders identity in ltr direction', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <EmbeddedTweetPreview
          post={{ ...basePost, language: 'fa' }}
          embeddedTweetAvatarUser={avatarUser}
          embeddedTweetIdentity="Noojaan Farahmand @noojaanf"
          textClampClass=""
        />
      </TestBootProvider>,
    );

    expect(
      screen.getByText('Noojaan Farahmand @noojaanf'),
    ).toHaveAttribute('dir', 'ltr');
  });

  it('does not render placeholder image as tweet media', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <EmbeddedTweetPreview
          post={{
            ...basePost,
            image:
              'https://media.daily.dev/image/upload/s--1KxV4ohY--/f_auto/v1722860400/public/Placeholder%2007',
          }}
          embeddedTweetAvatarUser={avatarUser}
          embeddedTweetIdentity="daily.dev @dailydotdev"
          textClampClass=""
          showMedia
        />
      </TestBootProvider>,
    );

    expect(screen.queryByAltText('Tweet media')).not.toBeInTheDocument();
  });

  it('renders tweet media when image is real', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <EmbeddedTweetPreview
          post={basePost}
          embeddedTweetAvatarUser={avatarUser}
          embeddedTweetIdentity="daily.dev @dailydotdev"
          textClampClass=""
          showMedia
        />
      </TestBootProvider>,
    );

    expect(screen.getByAltText('Tweet media')).toBeInTheDocument();
  });
});
