import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useQueryClient } from '@tanstack/react-query';
import { addHours } from 'date-fns';
import type {
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import { squadBrandingQueryOptions } from '@dailydotdev/shared/src/graphql/squadBranding';
import { squadProductsQueryOptions } from '@dailydotdev/shared/src/graphql/squadProducts';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadPageLayout } from '@dailydotdev/shared/src/features/squads/components/SquadPageLayout';
import { SquadProfileHeader } from '@dailydotdev/shared/src/features/squads/components/header/SquadProfileHeader';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';
import type { FreeBoostCardProps } from '@dailydotdev/shared/src/features/squads/components/freeBoost/FreeBoostCard';
import { FreeBoostCard } from '@dailydotdev/shared/src/features/squads/components/freeBoost/FreeBoostCard';
import { getStartupsStarterOffer } from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import ExtensionProviders from '../../extension/_providers';
import { entries, squad as data, team, toPost } from './data';

// The free $100 boost on a new company page's first post, as its admins see
// it on the page: before the first post, while the boost runs (one day), and
// the day after, when it turns into the upgrade. Sample numbers: $100 at the
// top markets' rate buys about 9,500 impressions.

const admin = {
  role: SourceMemberRole.Admin,
  referralToken: 'token',
  permissions: Object.values(SourcePermissions),
  user: {
    id: team[0].id,
    name: team[0].name,
    username: team[0].username,
    image: team[0].image,
    permalink: `https://app.daily.dev/${team[0].username}`,
    reputation: team[0].reputation,
  },
} as unknown as SourceMember;

const companyPage = {
  id: 'coderabbit',
  handle: data.handle,
  name: data.name,
  image: data.image,
  headerImage: data.headerImage,
  permalink: data.permalink,
  description: data.description,
  type: SourceType.Squad,
  public: true,
  active: true,
  membersCount: 4,
  memberPostingRole: SourceMemberRole.Moderator,
  memberInviteRole: SourceMemberRole.Member,
  moderationRequired: false,
  moderationPostCount: 0,
  createdAt: new Date(),
  category: { id: 'devtools', title: 'Developer tools', slug: 'devtools' },
  website: 'https://www.coderabbit.ai',
  links: [],
  rules: [],
  privilegedMembers: [admin],
  currentMember: admin,
  flags: {
    featured: false,
    totalPosts: 1,
    totalViews: 0,
    totalUpvotes: 0,
    totalAwards: 0,
  },
  features: {},
} as unknown as Squad;

// The cover is served from Storybook's public folder, so it renders offline too
const firstPost = {
  ...toPost(entries.find((entry) => entry.image) ?? entries[0]),
  image: '/squad-page/coderabbit-banner.jpg',
  source: companyPage,
};

const boostedPost = {
  title: firstPost.title ?? '',
  image: firstPost.image,
  permalink: firstPost.commentsPermalink ?? '#',
};

const launchOffer = getStartupsStarterOffer({ percentage: 500, months: 12 });
const regularOffer = getStartupsStarterOffer(null);

/** Seeds the queries the page reads, so it renders without the API. */
const Seeded = ({
  squad,
  children,
}: {
  squad: Squad;
  children: ReactNode;
}): ReactElement => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const seed = () => {
    client.setQueryData(
      squadMembersPreviewQueryOptions({ squad: squad }).queryKey,
      [],
    );
    [undefined, user].forEach((who) => {
      const squadKey = generateQueryKey(RequestKey.Squad, who, squad.handle);
      client.setQueryData(squadKey, squad);
      client.setQueryDefaults(squadKey, { staleTime: Infinity });
      const brandingKey = squadBrandingQueryOptions({
        squad: squad,
        user: who,
      }).queryKey;
      client.setQueryData(brandingKey, { color: null, button: null });
      client.setQueryDefaults(brandingKey, { staleTime: Infinity });
      const productsKey = squadProductsQueryOptions({
        squad: squad,
        user: who,
      }).queryKey;
      client.setQueryData(productsKey, []);
      client.setQueryDefaults(productsKey, { staleTime: Infinity });
    });
  };
  useState(() => {
    seed();
    return true;
  });
  useEffect(seed, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SpotlightProvider>
      <SquadPageContextProvider squad={squad} isViewerReady>
        {children}
      </SquadPageContextProvider>
    </SpotlightProvider>
  );
};

/** The company page with the card at the top of its feed column. */
const Page = ({
  card,
  hasPost = true,
}: {
  card: FreeBoostCardProps;
  hasPost?: boolean;
}): ReactElement => (
  <Seeded
    squad={
      hasPost
        ? companyPage
        : {
            ...companyPage,
            flags: { ...companyPage.flags, totalPosts: 0 },
          }
    }
  >
    <SquadPageLayout header={<SquadProfileHeader />} hasAboutTab>
      <div className="flex flex-col gap-4 border-border-subtlest-tertiary px-4 pt-4 tablet:px-6 tablet:pt-6 laptop:border-t">
        <FreeBoostCard {...card} />
      </div>
      <div
        className="grid gap-6 p-4 tablet:p-6"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))' }}
      >
        {hasPost && (
          <FreeformGrid
            post={firstPost}
            onPostClick={() => undefined}
            onPostAuxClick={() => undefined}
            onUpvoteClick={() => undefined}
            onDownvoteClick={() => undefined}
            onCommentClick={() => undefined}
            onBookmarkClick={() => undefined}
            onCopyLinkClick={() => undefined}
            onShare={() => undefined}
          />
        )}
      </div>
    </SquadPageLayout>
  </Seeded>
);

const meta: Meta = {
  title: 'Features/Squads/Free first-post boost',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="min-h-screen bg-background-default">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const now = new Date();

const liveCard: FreeBoostCardProps = {
  state: 'live',
  post: boostedPost,
  stats: {
    impressions: 5940,
    reach: 2480,
    clicks: 41,
    bookmarks: 7,
    followers: 7,
  },
  spent: 6300,
  budget: 10000,
  endsAt: addHours(now, 9),
  now,
};

const endedCard: FreeBoostCardProps = {
  state: 'ended',
  post: boostedPost,
  stats: {
    impressions: 9420,
    reach: 3910,
    clicks: 68,
    bookmarks: 12,
    followers: 9,
  },
  offer: launchOffer,
  checkoutUrl: '#',
};

/** A new company page with no post yet: write it and we boost it. */
export const BeforeFirstPost: Story = {
  render: () => (
    <Page hasPost={false} card={{ state: 'first_post', composeUrl: '#' }} />
  ),
};

/** The boost day: impressions lead, refreshed every 5 minutes. */
export const BoostLive: Story = {
  render: () => <Page card={liveCard} />,
};

/** Day 2: the results, then the upgrade, during the launch offer. */
export const BoostEnded: Story = {
  render: () => <Page card={endedCard} />,
};

/** Day 2 once the launch offer is over: Starter's own credits. */
export const BoostEndedNoLaunchOffer: Story = {
  render: () => (
    <Page card={{ ...endedCard, offer: regularOffer } as FreeBoostCardProps} />
  ),
};

export const BeforeFirstPostPhone: Story = {
  ...BeforeFirstPost,
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

export const BoostLivePhone: Story = {
  ...BoostLive,
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

export const BoostEndedPhone: Story = {
  ...BoostEnded,
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};
