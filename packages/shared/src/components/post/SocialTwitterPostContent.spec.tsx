import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment } from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { Origin } from '../../lib/log';
import { SocialTwitterPostContentRaw } from './SocialTwitterPostContent';

const tweetPost: Post = {
  ...postWithCommunitySentiment,
  type: PostType.SocialTwitter,
  subType: 'thread',
  title: 'A tweet about testing',
  contentHtml: '<p>Thread body</p>',
};

const renderContent = (
  post: Post,
  options: { isPostPage?: boolean; onClose?: () => void } = {},
) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <SocialTwitterPostContentRaw
        post={post}
        origin={Origin.ArticlePage}
        isPostPage={options.isPostPage ?? true}
        onClose={options.onClose}
      />
    </TestBootProvider>,
  );

describe('SocialTwitterPostContent community sentiment', () => {
  it('renders on the tweet post page when the post has a take', () => {
    renderContent(tweetPost);

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('renders in the tweet preview modal when the post has a take', () => {
    renderContent(tweetPost, {
      isPostPage: false,
      onClose: jest.fn(),
    });

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
  });

  it('stays hidden when the post has no take', () => {
    renderContent({ ...tweetPost, communitySentiment: undefined });

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});
