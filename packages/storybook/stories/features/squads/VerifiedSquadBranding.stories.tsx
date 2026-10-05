import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useQueryClient } from '@tanstack/react-query';
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
import type { SquadBranding } from '@dailydotdev/shared/src/graphql/squadBranding';
import { squadBrandingQueryOptions } from '@dailydotdev/shared/src/graphql/squadBranding';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadPageLayout } from '@dailydotdev/shared/src/features/squads/components/SquadPageLayout';
import { SquadProfileHeader } from '@dailydotdev/shared/src/features/squads/components/header/SquadProfileHeader';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManageBranding } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageBranding';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';
import { FreeformList } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformList';
import SquadEntityCard from '@dailydotdev/shared/src/components/cards/entity/SquadEntityCard';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import ExtensionProviders from '../../extension/_providers';
import { entries, squad as data, team, toPost } from '../../squad-page/data';

// PR 1 of Verified Company Squads, on the production components:
// - F3 header button: once joined, the company's button replaces Join
// - UI1 brand colour: the gradient under the cover and the header button
// - UI2 the verified seal after the squad's name (on the logo where the
//   name is not shown, e.g. feed cards)
// - Featured vs Verified: Featured is a blue card, purple is verified only
// The API does not need to be up: the queries are seeded below.

const member = (index: number, role: SourceMemberRole): SourceMember =>
  ({
    role,
    referralToken: 'token',
    user: {
      id: team[index].id,
      name: team[index].name,
      username: team[index].username,
      image: team[index].image,
      permalink: `https://app.daily.dev/${team[index].username}`,
      reputation: team[index].reputation,
    },
  } as unknown as SourceMember);

const verifiedSquad = {
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
  membersCount: data.membersCount,
  memberPostingRole: SourceMemberRole.Member,
  memberInviteRole: SourceMemberRole.Member,
  moderationRequired: false,
  moderationPostCount: 0,
  createdAt: new Date(data.createdAt),
  category: { id: 'devtools', title: 'Developer tools', slug: 'devtools' },
  website: 'https://www.coderabbit.ai',
  links: ['https://github.com/coderabbitai', 'https://x.com/coderabbitai'],
  rules: [],
  privilegedMembers: [member(0, SourceMemberRole.Admin)],
  flags: {
    featured: false,
    totalPosts: data.totalPosts,
    totalViews: data.totalViews,
    totalUpvotes: data.totalUpvotes,
    totalAwards: 0,
  },
  features: { verified: true, links: true },
} as unknown as Squad;

const branding: SquadBranding = {
  color: '#FF570A',
  button: {
    label: 'Start free trial',
    url: 'https://www.coderabbit.ai',
    enabled: true,
  },
};

const asMember = (squad: Squad): Squad => ({
  ...squad,
  currentMember: {
    ...member(4, SourceMemberRole.Member),
    permissions: [SourcePermissions.View, SourcePermissions.Post],
  } as SourceMember,
});

const asAdmin = (squad: Squad): Squad => ({
  ...squad,
  currentMember: {
    ...member(0, SourceMemberRole.Admin),
    permissions: Object.values(SourcePermissions),
  } as SourceMember,
});

const posts = entries
  .filter((entry) => entry.image)
  .slice(0, 4)
  .map((entry) => ({ ...toPost(entry), source: verifiedSquad }));

/** Seeds the queries the page reads, so it renders without the API. */
const Seeded = ({
  squad,
  brand,
  children,
}: {
  squad: Squad;
  brand?: SquadBranding;
  children: ReactNode;
}): ReactElement => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const seed = () => {
    client.setQueryData(
      squadMembersPreviewQueryOptions({ squad }).queryKey,
      [],
    );
    [undefined, user].forEach((who) => {
      const squadKey = generateQueryKey(RequestKey.Squad, who, squad.handle);
      client.setQueryData(squadKey, squad);
      client.setQueryDefaults(squadKey, { staleTime: Infinity });
      const brandingKey = squadBrandingQueryOptions({
        squad,
        user: who,
      }).queryKey;
      client.setQueryData(brandingKey, brand ?? { color: null, button: null });
      client.setQueryDefaults(brandingKey, { staleTime: Infinity });
    });
  };
  useState(() => {
    seed();
    return true;
  });
  // The signed-in user arrives after the first render; seed their keys too
  useEffect(seed, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SpotlightProvider>
      <SquadPageContextProvider squad={squad} isViewerReady>
        {children}
      </SquadPageContextProvider>
    </SpotlightProvider>
  );
};

const Page = ({
  squad,
  brand = branding,
}: {
  squad: Squad;
  brand?: SquadBranding;
}): ReactElement => (
  <Seeded squad={squad} brand={brand}>
    <SquadPageLayout header={<SquadProfileHeader />} hasAboutTab>
      <div
        className="grid gap-6 p-4 tablet:p-6"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))' }}
      >
        {posts.slice(0, 2).map((post) => (
          <FreeformGrid
            key={post.id}
            post={post}
            onPostClick={() => undefined}
            onPostAuxClick={() => undefined}
            onUpvoteClick={() => undefined}
            onDownvoteClick={() => undefined}
            onCommentClick={() => undefined}
            onBookmarkClick={() => undefined}
            onCopyLinkClick={() => undefined}
            onShare={() => undefined}
          />
        ))}
      </div>
    </SquadPageLayout>
  </Seeded>
);

const meta: Meta = {
  title: 'Features/Squads/Verified squad, brand and visibility',
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

/** Visitors see Join Squad and the brand gradient. */
export const Visitor: Story = {
  render: () => <Page squad={verifiedSquad} />,
};

/** Once joined, the company's button replaces Join, in the brand colour. */
export const Member: Story = {
  render: () => <Page squad={asMember(verifiedSquad)} />,
};

export const MemberPhone: Story = {
  ...Member,
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

/** No button set: members see Joined, as today. */
export const MemberWithoutButton: Story = {
  render: () => (
    <Page
      squad={asMember(verifiedSquad)}
      brand={{ ...branding, button: { ...branding.button!, enabled: false } }}
    />
  ),
};

/** A button but no brand colour: the app's primary button, no gradient. */
export const MemberWithoutColour: Story = {
  render: () => (
    <Page
      squad={asMember(verifiedSquad)}
      brand={{ ...branding, color: null }}
    />
  ),
};

/** A darker brand colour: the button text turns white for contrast. */
export const PurpleBrandColour: Story = {
  render: () => (
    <Page
      squad={asMember(verifiedSquad)}
      brand={{ ...branding, color: '#7147ED' }}
    />
  ),
};

export const Admin: Story = {
  render: () => <Page squad={asAdmin(verifiedSquad)} />,
};

export const AdminPhone: Story = {
  ...Admin,
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

/** Featured, not verified: the blue Featured Squad card, nothing in the header. */
export const FeaturedSquad: Story = {
  render: () => (
    <Page
      squad={{
        ...verifiedSquad,
        id: 'webdev',
        handle: 'webdev',
        name: 'WebDev',
        features: {} as Squad['features'],
        flags: { ...verifiedSquad.flags, featured: true } as Squad['flags'],
      }}
      brand={{ color: null, button: null }}
    />
  ),
};

/** Featured and verified: both cards. */
export const FeaturedAndVerified: Story = {
  render: () => (
    <Page
      squad={{
        ...verifiedSquad,
        flags: { ...verifiedSquad.flags, featured: true } as Squad['flags'],
      }}
    />
  ),
};

/** Manage › Branding: the colour, the header button, and a sketch of both. */
export const ManageBranding: Story = {
  render: () => (
    <Seeded squad={asAdmin(verifiedSquad)} brand={branding}>
      <SquadManageLayout section={SquadManageSection.Branding}>
        <SquadManageBranding />
      </SquadManageLayout>
    </Seeded>
  ),
};

export const ManageBrandingPhone: Story = {
  ...ManageBranding,
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

/** The seal outside the squad page: on the logo of a feed card, after the name elsewhere. */
export const SealAcrossTheApp: Story = {
  render: () => (
    <Seeded squad={verifiedSquad} brand={branding}>
      <div className="flex flex-col gap-8 p-6">
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-80">
            <FreeformGrid
              post={posts[2]}
              onPostClick={() => undefined}
              onPostAuxClick={() => undefined}
              onUpvoteClick={() => undefined}
              onDownvoteClick={() => undefined}
              onCommentClick={() => undefined}
              onBookmarkClick={() => undefined}
              onCopyLinkClick={() => undefined}
              onShare={() => undefined}
            />
          </div>
          <div className="w-80 rounded-16 border border-border-subtlest-tertiary">
            <SquadEntityCard
              handle={verifiedSquad.handle}
              origin={Origin.ArticlePage}
            />
          </div>
        </div>
        <div className="max-w-2xl">
          <FreeformList
            post={posts[3]}
            enableSourceHeader
            onPostClick={() => undefined}
            onPostAuxClick={() => undefined}
            onUpvoteClick={() => undefined}
            onDownvoteClick={() => undefined}
            onCommentClick={() => undefined}
            onBookmarkClick={() => undefined}
            onCopyLinkClick={() => undefined}
            onShare={() => undefined}
          />
        </div>
      </div>
    </Seeded>
  ),
};
