import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { PostUpvotesCommentsCount } from './PostUpvotesCommentsCount';
import basePost from '../../../__tests__/fixture/post';
import user from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { LoggedUser } from '../../lib/user';
import type { Post } from '../../graphql/posts';

const post: Post = {
  ...basePost,
  numUpvotes: 3,
  analytics: { impressions: 1200 },
};

const renderComponent = ({
  loggedUser,
  compact,
}: {
  loggedUser?: LoggedUser;
  compact?: boolean;
} = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, isLoggedIn: !!loggedUser }}
    >
      <PostUpvotesCommentsCount post={post} compact={compact} />
    </TestBootProvider>,
  );

const impressions = () => screen.queryByText('1.2K Impressions');

describe('PostUpvotesCommentsCount impressions', () => {
  it('shows the impressions stat to an anonymous reader', () => {
    renderComponent();

    expect(impressions()).toBeInTheDocument();
  });

  it('keeps the stat off a compact strip for another reader', () => {
    renderComponent({
      loggedUser: { ...user, id: 'someone-else' },
      compact: true,
    });

    expect(impressions()).not.toBeInTheDocument();
  });

  it('shows the author their impressions on a compact strip', () => {
    renderComponent({ loggedUser: user, compact: true });

    expect(impressions()).toBeInTheDocument();
  });
});
