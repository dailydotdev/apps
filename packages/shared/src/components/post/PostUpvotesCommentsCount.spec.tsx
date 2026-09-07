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
  postProps,
  compact,
}: {
  impressionsEnabled?: boolean;
  loggedUser?: LoggedUser;
  postProps?: Partial<Post>;
  compact?: boolean;
} = {}) => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureCardImpressions.id]: { defaultValue: impressionsEnabled },
  });
  const evaluate = jest.spyOn(gb, 'getFeatureValue');

  render(
    <TestBootProvider
      client={new QueryClient()}
      gb={gb}
      auth={{ user: loggedUser, isLoggedIn: !!loggedUser }}
    >
      <PostUpvotesCommentsCount
        post={{ ...post, ...postProps }}
        compact={compact}
      />
    </TestBootProvider>,
  );

  return evaluate;
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

  it('keeps the stat off a compact strip', () => {
    renderComponent({ impressionsEnabled: true, compact: true });

    expect(impressions()).not.toBeInTheDocument();
  });
});

describe('PostUpvotesCommentsCount impressions enrolment', () => {
  const wasEvaluated = (evaluate: jest.SpyInstance) =>
    evaluate.mock.calls.some(([id]) => id === featureCardImpressions.id);

  it('enrols a viewer who can see the difference', () => {
    expect(wasEvaluated(renderComponent())).toBe(true);
  });

  it('skips a post without impressions', () => {
    expect(
      wasEvaluated(renderComponent({ postProps: { analytics: {} } })),
    ).toBe(false);
  });

  it('skips a compact strip', () => {
    expect(wasEvaluated(renderComponent({ compact: true }))).toBe(false);
  });
});
