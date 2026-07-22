import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SquadGrid } from '@dailydotdev/shared/src/components/cards/squad/SquadGrid';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { UnfeaturedSquadGrid } from '@dailydotdev/shared/src/components/cards/squad/UnfeaturedSquadGrid';
import type {
  BasicSourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { ContentPreferenceType } from '@dailydotdev/shared/src/graphql/contentPreference';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';

const mockUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2024-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/testuser',
} as unknown as LoggedUser;

const buildSquad = (id: string, name: string, handle: string): Squad =>
  ({
    id,
    name,
    handle,
    permalink: `https://app.daily.dev/squads/${handle}`,
    active: true,
    public: true,
    type: SourceType.Squad,
    membersCount: 23209,
    description:
      'A place for developers who care about shipping fast without breaking prod. War stories, hot takes and the occasional postmortem.',
    memberPostingRole: SourceMemberRole.Member,
    memberInviteRole: SourceMemberRole.Member,
    image: 'https://via.placeholder.com/150',
    moderationRequired: false,
    moderationPostCount: 0,
  } as unknown as Squad);

const featured = buildSquad('squad-1', 'Ship It', 'ship-it');
const unfeatured = buildSquad('squad-2', 'Backend Bandits', 'backend-bandits');
const listed = buildSquad('squad-3', 'Frontend Friends', 'frontend-friends');
const squads = [featured, unfeatured, listed];

const members: BasicSourceMember[] = [1, 2, 3].map((i) => ({
  user: {
    id: `member-${i}`,
    name: `Member ${i}`,
    image:
      'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
    permalink: `https://daily.dev/member-${i}`,
  },
}));

const SHORT_LINK = 'https://dly.to/abc123';

// Storybook aliases `@growthbook/growthbook` to a mock whose `getFeatureValue`
// coerces every falsy default to the truthy string `'control'`, so a flag can't
// be evaluated as `false` here. Flag-off is therefore simulated by holding the
// features context as "not ready", which is the exact path
// `useConditionalFeature` takes to fall back to the (false) default value.
// Jest specs are the real flag-off guarantee.
const withProviders =
  (enabled: boolean) =>
  (Story: React.ComponentType): React.ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    squads.forEach((squad) => {
      // Seed the follow status so the Join Squad button actually renders.
      queryClient.setQueryData(
        generateQueryKey(RequestKey.ContentPreference, mockUser, {
          id: squad.id,
          entity: ContentPreferenceType.Source,
        }),
        null,
      );
      // Seed the member short-list used by the featured grid card.
      queryClient.setQueryData(
        generateQueryKey(RequestKey.SquadMembers, mockUser, squad.id),
        members,
      );
      // Seed the resolved short URL so copy actions don't hit the network.
      const { queryKey } = getShortLinkProps(
        squad.permalink,
        ReferralCampaignKey.ShareSource,
        mockUser,
      );
      queryClient.setQueryData(queryKey, SHORT_LINK);
    });

    const LogContext = getLogContextStatic();

    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={
            {
              user: mockUser,
              isLoggedIn: true,
              isAuthReady: true,
              tokenRefreshed: true,
              shouldShowLogin: false,
              showLogin: fn(),
              closeLogin: fn(),
              logout: fn(),
              updateUser: fn(),
              getRedirectUri: fn(),
              loadingUser: false,
              loadedUserFromCache: true,
              refetchBoot: fn(),
              squads: [],
              isAndroidApp: false,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          }
        >
          <GrowthBookProvider
            app={BootApp.Webapp}
            user={mockUser}
            deviceId="storybook"
          >
            <FeaturesReadyContext.Provider
              value={{
                ready: enabled,
                getFeatureValue: (feature) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  feature.defaultValue as any,
              }}
            >
              <LogContext.Provider
                value={{
                  logEvent: fn(),
                  logEventStart: fn(),
                  logEventEnd: fn(),
                  sendBeacon: () => false,
                }}
              >
                <Story />
              </LogContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

// All three directory card variants side by side: featured grid, unfeatured
// grid, and the mobile list row.
const DirectoryShowcase = (): React.ReactElement => (
  <div className="flex max-w-[44rem] flex-col gap-6 p-4">
    <div className="flex flex-row items-stretch gap-6">
      <SquadGrid className="w-80" source={featured} />
      <UnfeaturedSquadGrid className="w-80" source={unfeatured} />
    </div>
    <div className="rounded-16 border border-border-subtlest-tertiary p-4">
      <SquadList squad={listed} />
    </div>
  </div>
);

const meta: Meta<typeof DirectoryShowcase> = {
  title: 'Components/Cards/Squad/SquadDirectoryShare',
  component: DirectoryShowcase,
  parameters: {
    docs: {
      description: {
        component:
          'Copy-link/share control on the squad directory cards, next to a slightly-narrowed Join Squad button. Gated by `share_squad_directory` AND the `sharing_visibility` master flag; control renders the directory exactly as it ships today.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DirectoryShowcase>;

// Flag on — every card variant gains the copy-link trigger next to Join.
export const FlagOn: Story = {
  decorators: [withProviders(true)],
};

// Flag off — must render exactly what ships today (full-width Join on the
// featured grid, no share control anywhere).
export const FlagOff: Story = {
  decorators: [withProviders(false)],
};

// Desktop copy flow: the trigger opens the share popover; Copy link flips to
// Copied! The clipboard is stubbed because the Storybook iframe isn't allowed
// to write to the real one.
export const FlagOnCopying: Story = {
  decorators: [withProviders(true)],
  play: async ({ canvasElement }) => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    const canvas = within(canvasElement);
    const triggers = canvas.getAllByLabelText('Copy Squad link');
    await expect(triggers).toHaveLength(3);
    await userEvent.click(triggers[0]);

    const body = within(globalThis.document.body);
    await userEvent.click(await body.findByText('Copy link'));
    await waitFor(() => expect(body.getByText('Copied!')).toBeInTheDocument());
  },
};
