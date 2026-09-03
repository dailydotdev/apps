import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { PostUpvotesCommentsCount } from './PostUpvotesCommentsCount';
import basePost from '../../../__tests__/fixture/post';
import user from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { featureCardImpressions } from '../../lib/featureManagement';
import type { LoggedUser } from '../../lib/user';
import type { Post } from '../../graphql/posts';

const post: Post = {
  ...basePost,
  numUpvotes: 3,
  analytics: { impressions: 1200 },
};

const renderComponent = ({
  impressionsEnabled = false,
  loggedUser,
}: {
  impressionsEnabled?: boolean;
  loggedUser?: LoggedUser;
} = {}) => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureCardImpressions.id]: { defaultValue: impressionsEnabled },
  });

  return render(
    <TestBootProvider
      client={new QueryClient()}
      gb={gb}
      auth={{ user: loggedUser, isLoggedIn: !!loggedUser }}
    >
      <PostUpvotesCommentsCount post={post} />
    </TestBootProvider>,
  );
};

const impressions = () => screen.queryByText('1.2K Impressions');

describe('PostUpvotesCommentsCount impressions control', () => {
  it('hides the impressions count from an anonymous reader', () => {
    renderComponent();

    expect(impressions()).not.toBeInTheDocument();
  });

  it('hides the impressions count from another logged in reader', () => {
    renderComponent({ loggedUser: { ...user, id: 'someone-else' } });

    expect(impressions()).not.toBeInTheDocument();
  });

  it('shows the impressions count to the author', () => {
    renderComponent({ loggedUser: user });

    expect(impressions()).toBeInTheDocument();
  });

  it('shows the impressions count to a team member', () => {
    renderComponent({
      loggedUser: { ...user, id: 'someone-else', isTeamMember: true },
    });

    expect(impressions()).toBeInTheDocument();
  });
});

describe('PostUpvotesCommentsCount impressions variant', () => {
  it('shows the impressions stat to an anonymous reader', () => {
    renderComponent({ impressionsEnabled: true });

    expect(impressions()).toBeInTheDocument();
  });
});
