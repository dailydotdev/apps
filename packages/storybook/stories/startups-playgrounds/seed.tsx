import type { ReactElement, ReactNode } from 'react';
import type { SquadProduct } from '@dailydotdev/shared/src/graphql/squadProducts';
import { squadProductsQueryOptions } from '@dailydotdev/shared/src/graphql/squadProducts';
import type { SquadBranding } from '@dailydotdev/shared/src/graphql/squadBranding';
import { squadBrandingQueryOptions } from '@dailydotdev/shared/src/graphql/squadBranding';
import React, { useEffect, useState } from 'react';
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
import type {
  SquadSeatMember,
  SquadSubscription,
} from '@dailydotdev/shared/src/graphql/squadSubscription';
import {
  squadSeatMembersQueryOptions,
  squadSubscriptionBalanceQueryOptions,
  squadSubscriptionQueryOptions,
} from '@dailydotdev/shared/src/graphql/squadSubscription';
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';

// Sample data and query seeding for today's checkout, as in
// features/squads/StartupsCheckout.stories.tsx.

export const person = (
  id: string,
  name: string,
  role: SourceMemberRole,
  seat: boolean,
): SquadSeatMember => ({
  role,
  seat,
  user: {
    id,
    name,
    username: id,
    image: '',
    permalink: `https://daily.dev/${id}`,
  } as SquadSeatMember['user'],
});

export const owner: SquadSeatMember = {
  role: SourceMemberRole.Admin,
  seat: true,
  user: {
    id: defaultUser.id,
    name: defaultUser.name,
    username: defaultUser.username,
    image: defaultUser.image,
    permalink: defaultUser.permalink,
  } as SquadSeatMember['user'],
};

export const team = [
  owner,
  person('maya', 'Maya Levi', SourceMemberRole.Admin, true),
  person('jonas', 'Jonas Berg', SourceMemberRole.Moderator, false),
  person('priya', 'Priya Nair', SourceMemberRole.Moderator, false),
];

export const acme = {
  id: 'acme-squad',
  handle: 'acme',
  name: 'Acme',
  image: '/squad-page/acme-logo.svg',
  permalink: 'https://daily.dev/squads/acme',
  description: 'The software factory.',
  type: SourceType.Squad,
  public: true,
  active: true,
  membersCount: 214,
  memberPostingRole: SourceMemberRole.Moderator,
  memberInviteRole: SourceMemberRole.Member,
  moderationRequired: false,
  moderationPostCount: 0,
  createdAt: new Date('2026-10-01'),
  rules: [],
  links: [],
  features: {},
  currentMember: {
    role: SourceMemberRole.Admin,
    permissions: Object.values(SourcePermissions),
    referralToken: 'token',
    user: owner.user,
  } as unknown as SourceMember,
} as unknown as Squad;

// Acme once the Team plan switched its features on, with the description and
// website filled in and no product or header CTA yet.
export const acmeTeam = {
  ...acme,
  website: 'https://acme.dev',
  features: { links: true, products: true, cta: true, apiPosting: true },
} as unknown as Squad;

export const asModerator = (squad: Squad): Squad => ({
  ...squad,
  currentMember: {
    ...squad.currentMember,
    role: SourceMemberRole.Moderator,
    permissions: [
      SourcePermissions.View,
      SourcePermissions.Post,
      SourcePermissions.Edit,
      SourcePermissions.ModeratePost,
    ],
  } as SourceMember,
});

export const noPlan: SquadSubscription = {
  plan: null,
  status: 'none',
  seatLimit: 0,
  seatsUsed: 0,
  ownerId: null,
};

export const starter: SquadSubscription = {
  plan: SquadPlan.Starter,
  status: 'active',
  seatLimit: 1,
  seatsUsed: 1,
  ownerId: defaultUser.id,
};

export const teamPlan: SquadSubscription = {
  plan: SquadPlan.Team,
  status: 'active',
  seatLimit: 5,
  seatsUsed: 2,
  ownerId: defaultUser.id,
};

/** Seeds the queries the section reads, so it renders without the API. */
export const Seeded = ({
  squad,
  subscription,
  members = team,
  balance = 9800,
  products,
  branding,
  children,
}: {
  products?: SquadProduct[];
  branding?: SquadBranding;
  squad: Squad;
  subscription: SquadSubscription;
  members?: SquadSeatMember[];
  balance?: number;
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
      const pin = (queryKey: readonly unknown[], data: unknown) => {
        client.setQueryData(queryKey, data);
        client.setQueryDefaults(queryKey, { staleTime: Infinity });
      };
      pin(generateQueryKey(RequestKey.Squad, who, squad.handle), squad);
      const sourceId = squad.id;
      pin(
        squadSubscriptionQueryOptions({ user: who, sourceId }).queryKey,
        subscription,
      );
      pin(
        squadSubscriptionBalanceQueryOptions({ user: who, sourceId }).queryKey,
        balance,
      );
      pin(
        squadSeatMembersQueryOptions({ user: who, sourceId }).queryKey,
        members,
      );
      pin(
        squadProductsQueryOptions({ squad, user: who }).queryKey,
        products ?? [],
      );
      pin(
        squadBrandingQueryOptions({ squad, user: who }).queryKey,
        branding ?? { color: null, button: null },
      );
    });
  };
  useState(() => {
    seed();
    return true;
  });
  useEffect(seed, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SquadPageContextProvider squad={squad} isViewerReady>
      {children}
    </SquadPageContextProvider>
  );
};
