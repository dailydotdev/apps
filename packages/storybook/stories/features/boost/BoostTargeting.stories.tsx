import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { BoostPostModal } from '@dailydotdev/shared/src/features/boost/BoostPostModal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders from '../../extension/_providers';

// Mockup of audience targeting (tags and location) in the boost post modal

const post = {
  id: 'boost-post',
  title: 'I built an open-source feature flag service in Rust',
  createdAt: '2026-11-01T10:00:00.000Z',
  type: PostType.Article,
  tags: ['rust', 'open-source', 'devops'],
  author: defaultUser,
  source: {
    id: defaultUser.id,
    name: defaultUser.name,
    handle: defaultUser.username,
    image: defaultUser.image,
    type: SourceType.User,
  },
  permalink: 'https://daily.dev/posts/boost-post',
  commentsPermalink: 'https://daily.dev/posts/boost-post',
} as unknown as Post;

const handlers = [
  graphql.query('CompletedUserActions', () =>
    HttpResponse.json({ data: { actions: [] } }),
  ),
  graphql.query('SquadWallet', () =>
    HttpResponse.json({ data: { squadWallet: null } }),
  ),
  graphql.query('StartupsCashbackPromo', () =>
    HttpResponse.json({ data: { startupsCashbackPromo: null } }),
  ),
  // Narrower audiences reach fewer readers per day
  graphql.query('DailyCampaignReachEstimate', ({ variables }) => {
    const countries = variables.audience?.countries?.length ?? 0;
    const scale = countries ? Math.min(0.2 + countries * 0.04, 0.6) : 1;

    return HttpResponse.json({
      data: {
        dailyCampaignReachEstimate: {
          min: Math.round(1800 * scale),
          max: Math.round(4200 * scale),
        },
      },
    });
  }),
  graphql.query('SearchTags', ({ variables }) =>
    HttpResponse.json({
      data: {
        searchTags: {
          query: variables.query,
          tags: ['typescript', 'type-safety', 'typeorm'].map((name) => ({
            name,
          })),
        },
      },
    }),
  ),
  graphql.query('RecommendedTags', () =>
    HttpResponse.json({
      data: {
        recommendedTags: {
          tags: [
            'golang',
            'kubernetes',
            'backend',
            'feature-flags',
            'cloud',
            'webassembly',
            'systems-programming',
          ].map((name) => ({ name })),
        },
      },
    }),
  ),
];

const WhenUser = ({ children }: { children: ReactElement }) => {
  const { user } = useAuthContext();

  return user ? children : null;
};

const meta: Meta = {
  title: 'Features/Boost/Audience targeting',
  parameters: { layout: 'fullscreen', msw: { handlers } },
  beforeEach: () => {
    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: { ...defaultUser, balance: { amount: 12000 } },
      squads: [],
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    } as ReturnType<typeof getBootMock>);
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div id="__next" className="min-h-screen bg-background-default">
          <WhenUser>
            <Story />
          </WhenUser>
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

export const BoostPost: StoryObj = {
  render: () => (
    <BoostPostModal isOpen post={post} onRequestClose={() => undefined} />
  ),
};
