import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment } from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { Origin } from '../../lib/log';
import { featureCommunitySentiment } from '../../lib/featureManagement';
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
  options: { gb?: GrowthBook; isPostPage?: boolean; onClose?: () => void } = {},
) =>
  render(
    <TestBootProvider client={new QueryClient()} gb={options.gb}>
      <SocialTwitterPostContentRaw
        post={post}
        origin={Origin.ArticlePage}
        isPostPage={options.isPostPage ?? true}
        onClose={options.onClose}
      />
    </TestBootProvider>,
  );

const enabledGrowthBook = () => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureCommunitySentiment.id]: {
      defaultValue: true,
    },
  });
  return gb;
};

describe('SocialTwitterPostContent community sentiment', () => {
  it('renders on the tweet post page when the flag is enabled', () => {
    renderContent(tweetPost, { gb: enabledGrowthBook() });

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('renders in the tweet preview modal when the flag is enabled', () => {
    renderContent(tweetPost, {
      gb: enabledGrowthBook(),
      isPostPage: false,
      onClose: jest.fn(),
    });

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
  });

  it('stays hidden when the post has no take', () => {
    renderContent(
      { ...tweetPost, communitySentiment: undefined },
      { gb: enabledGrowthBook() },
    );

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });

  it('stays hidden when the flag is disabled', () => {
    renderContent(tweetPost);

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});
