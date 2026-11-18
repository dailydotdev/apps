import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useQueryClient } from '@tanstack/react-query';
import type {
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadProfileHeader } from '@dailydotdev/shared/src/features/squads/components/header/SquadProfileHeader';
import type {
  SquadValueStats,
  SquadValueUpgrade,
} from '@dailydotdev/shared/src/features/squads/components/valuePanel/SquadValuePanel';
import { SquadValuePanel } from '@dailydotdev/shared/src/features/squads/components/valuePanel/SquadValuePanel';
import { DeveloperTrendsWidget } from '@dailydotdev/shared/src/features/squads/components/valuePanel/DeveloperTrendsWidget';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders from '../../extension/_providers';

// The company page as its admin sees it: what daily.dev did for the page, led
// by impressions, and the week's developer trends in the right column. Free
// pages show Google and AI agents locked and the Starter offer; paid pages
// show the real numbers. Sample numbers, Acme is made up.

const COVER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1B5E"/><stop offset=".55" stop-color="#5B2FB0"/><stop offset="1" stop-color="#14B8C4"/></linearGradient></defs><rect width="1200" height="240" fill="url(#g)"/></svg>',
)}`;

const LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="20" fill="#fff"/><text x="48" y="64" font-family="Arial" font-weight="700" font-size="48" text-anchor="middle" fill="#111">A</text></svg>',
)}`;

const squad = {
  id: 'value-panel',
  handle: 'acme',
  name: 'Acme',
  image: LOGO,
  headerImage: COVER,
  permalink: '',
  description: 'The software factory for developer teams.',
  website: 'https://acme.dev',
  type: SourceType.Squad,
  public: true,
  active: true,
  membersCount: 41,
  memberPostingRole: SourceMemberRole.Moderator,
  memberInviteRole: SourceMemberRole.Member,
  moderationRequired: false,
  moderationPostCount: 0,
  createdAt: new Date('2026-11-04'),
  rules: [],
  links: [],
  flags: { totalPosts: 2, totalViews: 9412, totalUpvotes: 61 },
  features: {},
  currentMember: {
    role: SourceMemberRole.Admin,
    permissions: [],
  } as unknown as SourceMember,
} as unknown as Squad;

const freeStats: SquadValueStats = {
  impressions: 9412,
  reach: 7860,
  clicks: 214,
  engagement: 96,
  followers: 41,
};

const paidStats: SquadValueStats = {
  impressions: 48230,
  reach: 18420,
  clicks: 506,
  engagement: 241,
  followers: 153,
  agentViews: 312,
};

const upgrade: SquadValueUpgrade = {
  offer: {
    cashback: 500,
    promoLength: 'for your first year',
    monthlyCredits: 245,
    launchOffer: { cashback: 100, monthlyCredits: 49 },
  },
  checkoutUrl: '#',
};

const trends = {
  weekLabel: '9 to 15 Nov',
  topics: [
    { tag: 'tailscale', multiple: 4.2 },
    { tag: 'rust', multiple: 2.0 },
    { tag: 'ollama', multiple: 1.9 },
    { tag: 'ai-agents', multiple: 1.6 },
  ],
  tip: '"I built" and "we built" titles got 2.9x the comments of an average post.',
  reportUrl: '#',
};

const Header = (): ReactElement => {
  const client = useQueryClient();
  client.setQueryData(squadMembersPreviewQueryOptions({ squad }).queryKey, []);

  return <SquadProfileHeader />;
};

const SamplePost = ({ title }: { title: string }): ReactElement => (
  <article className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <p className="font-bold typo-title3">{title}</p>
    <div className="h-32 w-full rounded-12 bg-surface-float" />
  </article>
);

const BoostSlot = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex h-24 items-center justify-center rounded-12 border border-dashed border-border-subtlest-secondary text-center text-text-quaternary typo-footnote">
    {children}
  </div>
);

const Page = ({
  stats,
  isFree,
  boost,
}: {
  stats: SquadValueStats;
  isFree: boolean;
  boost?: ReactNode;
}): ReactElement => (
  <SquadPageContextProvider squad={squad} isViewerReady>
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-6 laptop:flex-row">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary">
        <Header />
        <div className="flex flex-col gap-4 border-t border-border-subtlest-tertiary p-4 tablet:p-6">
          <SquadValuePanel
            name={squad.name}
            stats={stats}
            upgrade={isFree ? upgrade : undefined}
            boost={boost}
          />
          <SamplePost title="How we cut our CI time in half with Acme" />
          <SamplePost title="Acme 2.0: run your test suite on every branch" />
        </div>
      </div>
      <aside className="flex w-full flex-col gap-4 laptop:w-80">
        <DeveloperTrendsWidget
          {...trends}
          upsell={
            isFree
              ? 'Starter gives you this report for your own 5 topics, with post ideas.'
              : undefined
          }
        />
      </aside>
    </div>
  </SquadPageContextProvider>
);

const WhenUser = ({ children }: { children: ReactElement }) => {
  const { user } = useAuthContext();

  return user ? children : null;
};

const meta: Meta = {
  title: 'Features/Squads/Company page value',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: defaultUser,
      squads: [],
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    } as ReturnType<typeof getBootMock>);
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <SpotlightProvider>
          <div className="p-4 tablet:p-6">
            <WhenUser>
              <Story />
            </WhenUser>
          </div>
        </SpotlightProvider>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const FreeAfterBoost: Story = {
  render: () => <Page stats={freeStats} isFree />,
};

export const FreeBoostLive: Story = {
  render: () => (
    <Page
      stats={{ ...freeStats, impressions: 3810, reach: 3180, clicks: 71 }}
      isFree
      boost={
        <BoostSlot>
          The live boost card with its progress bar goes here
        </BoostSlot>
      }
    />
  ),
};

export const Paid: Story = {
  render: () => <Page stats={paidStats} isFree={false} />,
};
