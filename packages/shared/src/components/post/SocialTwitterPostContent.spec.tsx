import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import postFixture from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { CommunitySentimentPost } from './focus/CommunitySentiment';
import { SocialTwitterPostContentRaw } from './SocialTwitterPostContent';
import { Origin } from '../../lib/log';
import { featureCommunitySentiment } from '../../lib/featureManagement';

// `PostSourceInfo` and `SquadPostWidgets` pull in their own data-fetching
// hooks (follow status, squad membership, share widgets, further reading)
// that are unrelated to the community sentiment gating under test here.
jest.mock('./PostSourceInfo', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./SquadPostWidgets', () => ({
  SquadPostWidgets: () => null,
}));
// `BasePostContent` renders `children` then the (heavy, comments-fetching)
// `PostEngagements` — stub it down to just its children so the assertions
// below cover exactly where the sentiment block is slotted in: after the
// tweet body, ahead of the (unmounted-here) comments/discussion section.
jest.mock('./BasePostContent', () => ({
  BasePostContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const communitySentiment: CommunitySentimentPost = {
  breakdown: { positive: 60, mixed: 30, critical: 10 },
  tldr: 'Developers are largely positive about this tweet.',
  postCount: 2,
  sources: ['Hacker News'],
  pros: [],
  cons: [],
  bySource: [],
  openQuestions: [],
  highlights: [],
  discussions: [
    {
      provider: 'hackernews',
      url: 'https://news.ycombinator.com/item?id=1',
      points: 10,
      commentsCount: 5,
    },
  ],
};

const tweetPost: Post = {
  ...postFixture,
  type: PostType.SocialTwitter,
  subType: 'thread',
  title: 'A tweet about testing',
  contentHtml: undefined,
  content: undefined,
};

interface RenderOptions {
  isPostPage?: boolean;
  onClose?: () => void;
  /** Override the (always-`false`-by-default) experiment flag. */
  flagEnabled?: boolean;
}

const renderComponent = (
  post: Post,
  { isPostPage = true, onClose, flagEnabled = false }: RenderOptions = {},
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureCommunitySentiment.id]: { defaultValue: flagEnabled },
  });

  return render(
    <TestBootProvider client={client} gb={gb}>
      <SocialTwitterPostContentRaw
        post={post}
        origin={Origin.ArticlePage}
        isPostPage={isPostPage}
        onClose={onClose}
      />
    </TestBootProvider>,
  );
};

describe('SocialTwitterPostContent - community sentiment', () => {
  it('renders the sentiment block when the post has a take and the flag is on', () => {
    renderComponent(
      { ...tweetPost, communitySentiment },
      { flagEnabled: true },
    );

    expect(
      screen.getByText('Developers are largely positive about this tweet.'),
    ).toBeInTheDocument();
  });

  it('does not render without a take, even with the flag on', () => {
    renderComponent(
      { ...tweetPost, communitySentiment: null },
      { flagEnabled: true },
    );

    expect(
      screen.queryByText('Developers are largely positive about this tweet.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('What the community thinks'),
    ).not.toBeInTheDocument();
  });

  it('does not render with a take when the flag is off', () => {
    renderComponent(
      { ...tweetPost, communitySentiment },
      { flagEnabled: false },
    );

    expect(
      screen.queryByText('Developers are largely positive about this tweet.'),
    ).not.toBeInTheDocument();
  });

  it('does not render in the preview modal, even with a take and the flag on', () => {
    renderComponent(
      { ...tweetPost, communitySentiment },
      { flagEnabled: true, isPostPage: false, onClose: jest.fn() },
    );

    expect(
      screen.queryByText('Developers are largely positive about this tweet.'),
    ).not.toBeInTheDocument();
  });
});
