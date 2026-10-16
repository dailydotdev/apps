import React, { useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { waitFor } from 'storybook/test';
import { graphql, HttpResponse } from 'msw';
import ExtensionProviders from '../../extension/_providers';
import { providerHandlers } from '../why-recommended/whyRecommended.mocks';
import type { Decision, PersonalizationState } from './policy/rank';
import { getExclusion } from './policy/rank';
import { TopicMode } from './policy/profile';
import {
  defaultParams,
  formatParam,
  ParamGroup,
  paramGroups,
  paramMeta,
  policyVersion,
} from './policy/params';
import {
  PersonalizationProvider,
  usePersonalization,
} from './components/PersonalizationContext';
import {
  ControlSection,
  FeedScreenContext,
  getSignalCounts,
} from './components/FeedScreenContext';
import { ExplainDetailsModal } from './components/ExplainDetails';
import {
  AppView,
  CardFrame,
  FeedExplainPage,
  FeedLayout,
} from './components/FeedExplainPage';
import { candidatePool, PersonaId, personas } from './personas';

// Follow and block in the full explanation update the feed settings cache
// optimistically and roll back on error, so the mutations have to succeed.
const feedSettingsHandlers = [
  ...['AddFiltersToFeed', 'RemoveFiltersFromFeed'].map((name) =>
    graphql.mutation(name, () =>
      HttpResponse.json({ data: { feedSettings: { id: 'for-you' } } }),
    ),
  ),
  ...['Follow', 'Unfollow', 'Block', 'Unblock'].map((name) =>
    graphql.mutation(name, () =>
      HttpResponse.json({ data: { [name.toLowerCase()]: { _: true } } }),
    ),
  ),
];

const meta: Meta = {
  title: 'Features/Feed Explain',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [...providerHandlers, ...feedSettingsHandlers] },
  },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const Screen = ({
  persona = PersonaId.TwoWeeksIn,
  layout = FeedLayout.Grid,
  ...props
}: {
  persona?: PersonaId;
  layout?: FeedLayout;
  initialExplain?: boolean;
  initialView?: AppView;
  initialSection?: ControlSection;
  initialDetailsId?: string;
}): ReactElement => (
  <ExtensionProviders>
    <div id="__next">
      <FeedExplainPage
        pool={candidatePool}
        initialState={personas[persona].state}
        layout={layout}
        {...props}
      />
    </div>
  </ExtensionProviders>
);

export const Prototype: Story = {
  name: '1 · Prototype',
  render: () => <Screen />,
};

export const ExplainOn: Story = {
  name: '2 · Explain on',
  render: () => <Screen initialExplain />,
};

export const ReasonControls: Story = {
  name: '3 · Reason controls',
  render: () => <Screen initialExplain />,
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const chip = canvasElement.querySelector<HTMLButtonElement>(
        'ul[aria-label="What moved this post"] button',
      );
      if (!chip) {
        throw new Error('Waiting for reason chips');
      }
      chip.click();
    });
  },
};

export const FullExplanation: Story = {
  name: '4 · Full explanation',
  render: () => <Screen initialExplain initialDetailsId="Rvo54Shm1" />,
};

export const Controls: Story = {
  name: '5 · Personalization controls',
  render: () => <Screen initialExplain initialView={AppView.Controls} />,
};

export const JustSignedUp: Story = {
  name: '6 · Just signed up',
  render: () => <Screen persona={PersonaId.JustSignedUp} initialExplain />,
};

export const Phone: Story = {
  name: '7 · Phone',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: () => <Screen layout={FeedLayout.List} initialExplain />,
};

export const PhoneControls: Story = {
  name: '8 · Phone controls',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: () => (
    <Screen
      layout={FeedLayout.List}
      initialExplain
      initialView={AppView.Controls}
    />
  ),
};

interface CardState {
  title: string;
  note: string;
  id: string;
  persona?: PersonaId;
  change?: (state: PersonalizationState) => PersonalizationState;
  layout?: FeedLayout;
}

const withControl = (tag: string, mode: TopicMode) => (
  state: PersonalizationState,
): PersonalizationState => ({
  ...state,
  controls: { ...state.controls, [tag]: { mode } },
});

const cardStates: CardState[] = [
  {
    title: 'Topic you follow',
    note: 'A followed topic you read often: the strongest kind of match.',
    id: 'EYFcaEcVd',
  },
  {
    title: 'Source you follow',
    note: 'A follow brings every post in and multiplies it.',
    id: 'Rvo54Shm1',
  },
  {
    title: 'Learned from reading',
    note: 'Never followed; six stories in two weeks made it strong.',
    id: 'MsFCKRbGk',
  },
  {
    title: "A topic's turn",
    note: 'Docker had not been on the first screen lately, so it jumped ahead.',
    id: 'JKsEou23l',
  },
  {
    title: 'Variety pushed it down',
    note: 'The third Fireship post on the page, so it gives way.',
    id: '1XMQ9zlpA',
  },
  {
    title: 'Popular fill-in',
    note: 'A new viewer with two topics; the popular lane tops up the page.',
    id: 'JKsEou23l',
    persona: PersonaId.JustSignedUp,
  },
  {
    title: 'Showing more',
    note: 'More pressed on #rust. Its row turns green and it ranks higher next refresh.',
    id: 'BjYAz50EA',
    change: withControl('rust', TopicMode.Boosted),
  },
  {
    title: 'Muted a learned topic',
    note: 'Reading about #career stops counting, so this card leaves.',
    id: 'MsFCKRbGk',
    change: withControl('career', TopicMode.Muted),
  },
  {
    title: 'Blocked a source',
    note: 'Every XDA Developers card shows this at once.',
    id: 'DFJTpz2Tw',
    change: (state) => ({
      ...state,
      blockedSources: [...state.blockedSources, 'xda-developers'],
    }),
  },
  {
    title: 'Fewer like this',
    note: 'The post-level escape hatch when no single reason is the problem.',
    id: 'AzxnBHN3V',
    change: (state) => ({ ...state, hidden: [...state.hidden, 'AzxnBHN3V'] }),
  },
];

const listStates: CardState[] = [
  {
    title: 'List card',
    note: 'On phones the explanation covers the real list card, so nothing in the feed moves.',
    id: 'DFJTpz2Tw',
    layout: FeedLayout.List,
  },
  {
    title: 'List card, leaving',
    note: 'The title fades; the notice offers the matching fix.',
    id: 'DFJTpz2Tw',
    layout: FeedLayout.List,
    change: (state) => ({
      ...state,
      blockedSources: [...state.blockedSources, 'xda-developers'],
    }),
  },
];

const StateCardBody = ({
  id,
  layout,
}: {
  id: string;
  layout: FeedLayout;
}): ReactElement => {
  const store = usePersonalization();
  const [details, setDetails] = useState<Decision | null>(null);
  const counts = useMemo(() => getSignalCounts(store.served), [store.served]);
  const screen = useMemo(() => ({ counts, onOpenDetails: setDetails }), [counts]);
  const decision = store.served.find(({ post }) => post.id === id);
  if (!decision) {
    return <p className="text-text-tertiary typo-footnote">Not on the page.</p>;
  }

  return (
    <FeedScreenContext.Provider value={screen}>
      <CardFrame
        decision={decision}
        leaving={getExclusion(decision, store.pool, store.state)}
        index={0}
        layout={layout}
        isExplain
      />
      {details && (
        <ExplainDetailsModal decision={details} onClose={() => setDetails(null)} />
      )}
    </FeedScreenContext.Provider>
  );
};

const StateCard = ({ state }: { state: CardState }): ReactElement => {
  const base = personas[state.persona ?? PersonaId.TwoWeeksIn].state;

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="flex flex-col gap-1">
        <span className="font-bold text-text-primary typo-callout">
          {state.title}
        </span>
        <span className="text-text-tertiary typo-footnote">{state.note}</span>
      </figcaption>
      <PersonalizationProvider
        pool={candidatePool}
        initialState={state.change ? state.change(base) : base}
        servedState={base}
      >
        <StateCardBody id={state.id} layout={state.layout ?? FeedLayout.Grid} />
      </PersonalizationProvider>
    </figure>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
    {children}
  </section>
);

export const CardStates: Story = {
  name: '9 · Card states',
  render: () => (
    <ExtensionProviders>
      <div id="__next" className="flex flex-col gap-12 p-6 tablet:p-10">
        <header className="flex max-w-[45rem] flex-col gap-2">
          <h1 className="font-bold text-text-primary typo-title2">
            Explain mode, card by card
          </h1>
          <p className="text-text-secondary typo-callout">
            Each card keeps its source and title and says why it is here: one
            sentence for the reason, chips for what moved it up or down (tap
            one to see the math and change that part of the policy), and the
            post&apos;s topics and source with less, more and block. Full
            explanation opens the &quot;Why am I seeing this?&quot; view with
            the score breakdown.
          </p>
        </header>
        <Section title="Grid">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 tablet:grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4">
            {cardStates.map((state) => (
              <StateCard key={state.title} state={state} />
            ))}
          </div>
        </Section>
        <Section title="List">
          <div className="grid max-w-[60rem] grid-cols-1 gap-8 laptop:grid-cols-2">
            {listStates.map((state) => (
              <StateCard key={state.title} state={state} />
            ))}
          </div>
        </Section>
      </div>
    </ExtensionProviders>
  ),
};

enum Status {
  Exists = 'exists',
  Config = 'config',
  Missing = 'missing',
}

const statusLabel: Record<Status, { label: string; className: string }> = {
  [Status.Exists]: {
    label: 'Exists',
    className: 'bg-accent-avocado-flat text-accent-avocado-default',
  },
  [Status.Config]: {
    label: 'In the policy, not per user',
    className: 'bg-accent-cheese-flat text-accent-cheese-default',
  },
  [Status.Missing]: {
    label: 'New',
    className: 'bg-accent-bun-flat text-accent-bun-default',
  },
};

const specRows: Array<{
  control: string;
  status: Status;
  today: string;
  needs: string;
}> = [
  {
    control: 'Follow and unfollow topics, sources, squads, people',
    status: Status.Exists,
    today: 'allowed_tags, followed_sources, squad_ids, followed_user_ids',
    needs: 'Nothing',
  },
  {
    control: 'Block topics, sources, people',
    status: Status.Exists,
    today: 'blocked_tags, blocked_sources, blocked_author_ids',
    needs: 'Nothing',
  },
  {
    control: 'Fewer like this',
    status: Status.Exists,
    today: 'Hide; remove_engaged_posts drops it',
    needs: 'Nothing',
  },
  {
    control: 'More and Less on a topic',
    status: Status.Config,
    today:
      'control_boost and control_demote are in the config but BuildInterests never applies them',
    needs: 'Per-user, per-topic controls stored and applied in BuildInterests',
  },
  {
    control: 'Exact topic boost, down to Off',
    status: Status.Missing,
    today: 'Weights are computed per request',
    needs:
      'A per-topic override that replaces the computed weight; 0 drops the topic',
  },
  {
    control: 'Exact source boost',
    status: Status.Missing,
    today:
      'Sources only have follow and block; the follow boost is one global value',
    needs: 'A per-source multiplier that replaces the follow factor',
  },
  {
    control: 'Ranking knobs',
    status: Status.Config,
    today:
      'retriever_config is global per cohort; it travels inline on every request and is part of the cache key',
    needs:
      'daily-api or lofn merges the user’s overrides into retriever_config, clamped to policy.Parse ranges',
  },
  {
    control: 'Learn from my reading',
    status: Status.Config,
    today: 'inferred_interests.enabled is per provider',
    needs: 'Set it per user',
  },
  {
    control: 'Popular fill-ins',
    status: Status.Config,
    today: 'The cs and po lanes fill what the challenger leaves empty',
    needs: 'Drop those lanes per user',
  },
  {
    control: 'Forget what the feed learned',
    status: Status.Missing,
    today:
      'The delta job rebuilds 90 days of evidence every 5 minutes, so deleting the profile does not stick',
    needs: 'A per-user evidence cutoff date the job respects',
  },
  {
    control: 'Forget what you scrolled past',
    status: Status.Exists,
    today: 'Impression counts in Redis per user',
    needs: 'An endpoint that clears them',
  },
  {
    control: 'Reasons and factors on each card',
    status: Status.Missing,
    today:
      'The policy computes them and logs them to fss_events provider_metadata; the API returns only post ids',
    needs: 'Return the decision with each post, or look it up by request id',
  },
  {
    control: 'Left out list',
    status: Status.Missing,
    today: 'feed_candidates logs up to 500 eligible cards per request',
    needs: 'Log exclusion reasons too, and an endpoint to read them',
  },
  {
    control: 'Your interest profile',
    status: Status.Missing,
    today: 'Stored per user in Redis and Postgres; no API returns it',
    needs: 'An endpoint that returns the labelled, weighted profile',
  },
  {
    control: 'Connect your agent',
    status: Status.Missing,
    today:
      'The MCP server at api.daily.dev/mcp can already follow, unfollow and block topics and sources',
    needs:
      'MCP tools for the rest of this page: read the profile and the left-out list, set boosts and ranking settings, run the resets',
  },
];

export const Spec: Story = {
  name: '10 · What it needs',
  render: () => (
    <div className="flex flex-col gap-8 p-6 tablet:p-10">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-title2">
          Full control over For You: what exists and what it needs
        </h1>
        <p className="text-text-secondary typo-callout">
          The story runs a copy of <code>{policyVersion}</code>, the challenger
          policy For You uses, over real posts. Every reason, chip, weight and
          left-out group comes from that copy, so changing a control re-ranks
          the page the same way the feed would. It simplifies four things:
          reader response compares posts here instead of using the source prior,
          the first tag is the main topic, topic similarity is tag overlap
          instead of tag embeddings, and placement swaps are left out.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left typo-footnote">
          <thead>
            <tr className="border-b border-border-subtlest-tertiary text-text-tertiary">
              <th className="py-2 pr-4 font-bold">Control</th>
              <th className="py-2 pr-4 font-bold">Status</th>
              <th className="py-2 pr-4 font-bold">Today</th>
              <th className="py-2 font-bold">Needs</th>
            </tr>
          </thead>
          <tbody>
            {specRows.map((row) => (
              <tr
                key={row.control}
                className="border-b border-border-subtlest-tertiary align-top"
              >
                <td className="py-3 pr-4 font-bold text-text-primary">
                  {row.control}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex rounded-6 px-1.5 py-0.5 font-bold typo-caption2 ${
                      statusLabel[row.status].className
                    }`}
                  >
                    {statusLabel[row.status].label}
                  </span>
                </td>
                <td className="py-3 pr-4 text-text-secondary">{row.today}</td>
                <td className="py-3 text-text-secondary">{row.needs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="flex flex-col gap-3">
        <header className="flex max-w-[48rem] flex-col gap-1">
          <h2 className="font-bold text-text-primary typo-title3">
            Ranking settings and their config keys
          </h2>
          <p className="text-text-secondary typo-callout">
            Each setting in the panel writes one <code>retriever_config</code>{' '}
            value. Topic and per-source boosts show as the multiplier they give,
            so a topic weight of 0.30 reads as ×1.30.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left typo-footnote">
            <thead>
              <tr className="border-b border-border-subtlest-tertiary text-text-tertiary">
                <th className="py-2 pr-4 font-bold">Group</th>
                <th className="py-2 pr-4 font-bold">Setting</th>
                <th className="py-2 pr-4 font-bold">Key</th>
                <th className="py-2 font-bold">Default</th>
              </tr>
            </thead>
            <tbody>
              {paramMeta
                .filter(({ group }) => group !== ParamGroup.Adjustments)
                .map((meta) => (
                  <tr
                    key={meta.key}
                    className="border-b border-border-subtlest-tertiary align-top"
                  >
                    <td className="py-2 pr-4 text-text-tertiary">
                      {
                        paramGroups.find(({ group }) => group === meta.group)
                          ?.title
                      }
                    </td>
                    <td className="py-2 pr-4 text-text-primary">
                      {meta.label}
                    </td>
                    <td className="py-2 pr-4 text-text-secondary">
                      <code>{meta.key}</code>
                    </td>
                    <td className="py-2 tabular-nums text-text-secondary">
                      {formatParam(meta.format, defaultParams[meta.key])}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  ),
};
