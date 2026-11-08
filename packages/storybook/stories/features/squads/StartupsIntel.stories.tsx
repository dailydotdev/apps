import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
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
  SquadIntel,
  SquadIntelSettings,
} from '@dailydotdev/shared/src/graphql/squadIntel';
import {
  squadIntelQueryOptions,
  squadIntelSettingsQueryOptions,
} from '@dailydotdev/shared/src/graphql/squadIntel';
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManageIntel } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageIntel';
import { SquadIntelPage } from '@dailydotdev/shared/src/features/squads/components/SquadIntelPage';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import {
  IntelRegion,
  IntelSeniority,
} from '@dailydotdev/shared/src/features/squads/lib/intel';
import { featureStartupsCheckout } from '@dailydotdev/shared/src/lib/featureManagement';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import { PromptElement } from '@dailydotdev/shared/src/components/modals/Prompt';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import ExtensionProviders from '../../extension/_providers';

// Manage › Weekly intel for a paid seat of Acme, the sample company. The
// numbers below are made up; the queries are seeded, so no API is needed.

const acme = {
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
  features: { links: true, products: true, cta: true },
  currentMember: {
    role: SourceMemberRole.Admin,
    permissions: Object.values(SourcePermissions),
    referralToken: 'token',
    seat: true,
    user: { id: defaultUser.id },
  } as unknown as SourceMember,
} as unknown as Squad;

// The Monday the weekly run builds the next intel
const nextIntelAt = '2026-11-09T00:00:00.000Z';

const starterLimits = { tags: 5, seniority: false, regions: false };
const teamLimits = { tags: 20, seniority: true, regions: false };
const enterpriseLimits = { tags: 40, seniority: true, regions: true };

const tags = ['observability', 'opentelemetry', 'kubernetes', 'devops', 'sre'];

const markdown = `# Weekly intel: Oct 26 to Nov 1

Audience: mid-level engineers (2 to 6 years) and senior engineers (over 6 years). Topics: #observability, #opentelemetry, #kubernetes, #devops and #sre.

Most numbers are an index where 100 is the average post in your topics, read by this audience this week. 200 is twice the average and 50 is half. "Posts" is how many public posts a figure is based on.

## Your topics

| Topic | Share of attention | Change | Reads per post | Bookmarks | Competition | Reads to the top 10% of posts |
| --- | --- | --- | --- | --- | --- | --- |
| #kubernetes | 41% | +6% | 112 | 131 | Open | 79% |
| #devops | 27% | −4% | 88 | 94 | Crowded | 71% |
| #observability | 15% | +22% | 134 | 168 | Open | 83% |
| #sre | 11% | +3% | 97 | 120 | Moderate | 76% |
| #opentelemetry | 6% | +41% | 151 | 204 | Open | 88% |

Share of attention is the part of your audience's reads in your topics that went to each one. Change is against the week before.

## What else your audience reads

| Rank | Tag | Also read by | Against your whole audience | Change |
| --- | --- | --- | --- | --- |
| 1 | #grafana | 9% | 2.4× | +18% |
| 2 | #prometheus | 12% | 2.1× | +7% |
| 3 | #ebpf | 6% | 2.0× | new |
| 4 | #platform-engineering | 14% | 1.8× | +31% |
| 5 | #rust | 17% | 1.5× | −9% |

Rising fastest: #ebpf (new), #platform-engineering (+31%) and #grafana (+18%).

## Top posts this week

| # | Post | Source | Reads vs average | Upvotes | Comments |
| --- | --- | --- | --- | --- | --- |
| 1 | [How we cut our tracing bill by 80%](https://example.com/1) | Acme Blog | 6.2× | 412 | 38 |
| 2 | [OpenTelemetry Collector in production](https://example.com/2) | daily.dev | 4.8× | 287 | 21 |
| 3 | [SLOs that engineers actually read](https://example.com/3) | Medium | 3.9× | 198 | 17 |

## Timing

When your audience reads (share of the week's reads): Mon 17%, Tue 18%, Wed 17%, Thu 16%, Fri 13%, Sat 9%, Sun 10%.

Posts published on Tuesday, and posts published 14:00 to 17:00 UTC, get the strongest first day. Saturday is the weakest day to publish.
`;

const intel: SquadIntel = {
  weekStart: '2026-10-26T00:00:00.000Z',
  weekEnd: '2026-11-02T00:00:00.000Z',
  selection: {
    tags,
    seniority: [IntelSeniority.Mid, IntelSeniority.Senior],
    regions: null,
  },
  broadened: false,
  markdown,
  generatedAt: '2026-11-02T00:20:00.000Z',
};

// Saving answers like the API, and the first intel is ready a few seconds
// after the first save, so the stories show the whole flow
let firstIntelReadyAt: number | null = null;

const apiHandlers = (limits: SquadIntelSettings['limits']) => [
  graphql.mutation('UpdateSquadIntelSettings', async ({ variables }) => {
    await delay(600);
    firstIntelReadyAt ??= Date.now() + 5000;

    return HttpResponse.json({
      data: {
        updateSquadIntelSettings: {
          selection: {
            tags: variables.tags,
            seniority: variables.seniority ?? null,
            regions: variables.regions ?? null,
          },
          limits,
          nextIntelAt,
        },
      },
    });
  }),
  graphql.query('SearchTags', ({ variables }) =>
    HttpResponse.json({
      data: {
        searchTags: {
          query: variables.query,
          tags: [...tags, 'grafana', 'prometheus']
            .filter((tag) => tag.includes(variables.query))
            .map((name) => ({ name })),
        },
      },
    }),
  ),
  graphql.query('SquadIntel', () =>
    HttpResponse.json({
      data: {
        squadIntel:
          firstIntelReadyAt && Date.now() >= firstIntelReadyAt ? intel : null,
      },
    }),
  ),
];

const Seeded = ({
  settings,
  latest,
  isPage = false,
}: {
  settings: SquadIntelSettings;
  latest: SquadIntel | null;
  /** The reading page instead of Manage */
  isPage?: boolean;
}): ReactElement => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const seed = () => {
    client.setQueryData(
      squadMembersPreviewQueryOptions({ squad: acme }).queryKey,
      [],
    );
    [undefined, user].forEach((who) => {
      const pin = (queryKey: readonly unknown[], data: unknown) => {
        client.setQueryData(queryKey, data);
        client.setQueryDefaults(queryKey, { staleTime: Infinity });
      };
      pin(generateQueryKey(RequestKey.Squad, who, acme.handle), acme);
      pin(
        squadIntelSettingsQueryOptions({ user: who, sourceId: acme.id })
          .queryKey,
        settings,
      );
      pin(
        squadIntelQueryOptions({ user: who, sourceId: acme.id }).queryKey,
        latest,
      );
    });
  };
  useState(() => {
    firstIntelReadyAt = null;
    seed();
    return true;
  });
  useEffect(seed, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SquadPageContextProvider squad={acme} isViewerReady>
      {isPage ? (
        <SquadIntelPage />
      ) : (
        <SquadManageLayout section={SquadManageSection.Intel}>
          <SquadManageIntel />
        </SquadManageLayout>
      )}
      <PromptElement />
      <Toast autoDismissNotifications />
    </SquadPageContextProvider>
  );
};

const meta: Meta = {
  title: 'Features/Squads/daily.dev for Startups intel',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <FeatureOverrides values={{ [featureStartupsCheckout.id]: true }}>
          {/* react-modal looks for the app root while the prompt renders */}
          <div id="__next" className="min-h-screen bg-background-default">
            <Story />
          </div>
        </FeatureOverrides>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const phone = { viewport: { value: 'mobile2', isRotated: false } };

/**
 * Starter, right after checkout: no topics, no intel yet. Saving asks to
 * confirm the settings, then the first intel shows up a few seconds later.
 */
export const StarterEmpty: Story = {
  parameters: { msw: { handlers: apiHandlers(starterLimits) } },
  render: () => (
    <Seeded
      settings={{ selection: null, limits: starterLimits, nextIntelAt }}
      latest={null}
    />
  ),
};

/** Starter with topics saved, waiting for the first intel. */
export const StarterWaiting: Story = {
  render: () => (
    <Seeded
      settings={{
        selection: { tags, seniority: null, regions: null },
        limits: starterLimits,
        nextIntelAt,
      }}
      latest={null}
    />
  ),
};

/** Team with seniority on and last week's intel below. Saving says when the
 * change shows. */
export const TeamWithIntel: Story = {
  parameters: { msw: { handlers: apiHandlers(teamLimits) } },
  render: () => (
    <Seeded
      settings={{ selection: intel.selection, limits: teamLimits, nextIntelAt }}
      latest={intel}
    />
  ),
};

export const TeamWithIntelPhone: Story = { ...TeamWithIntel, globals: phone };

/** Enterprise: every filter, regions included. */
export const Enterprise: Story = {
  render: () => (
    <Seeded
      settings={{
        selection: {
          tags,
          seniority: [IntelSeniority.Senior],
          regions: [IntelRegion.NorthAmerica, IntelRegion.Europe],
        },
        limits: enterpriseLimits,
        nextIntelAt,
      }}
      latest={intel}
    />
  ),
};

/** The intel page the notification opens: last week's intel in full. */
export const IntelPage: Story = {
  render: () => (
    <Seeded
      settings={{ selection: intel.selection, limits: teamLimits, nextIntelAt }}
      latest={intel}
      isPage
    />
  ),
};

export const IntelPagePhone: Story = { ...IntelPage, globals: phone };
