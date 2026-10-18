import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { delay, graphql, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { OnboardingChromeVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getFeedSettingsQueryKey } from '@dailydotdev/shared/src/hooks/useFeedSettings';
import type { FeedSettingsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { bootAsUser, FunnelStepShell } from '../signupFunnel.mocks';
import { FunnelCommunities } from './FunnelCommunities';
import { CommunityPackRow } from './CommunityPackRow';
import type { PackCoverVariant } from './PackCover';
import { buildCommunityPacks } from './communityPacks';
import {
  COMMUNITY_PACK_TOPICS,
  SUGGESTED_TOPICS,
} from './communityPacks.fixture';

/**
 * **Join communities**: a signup onboarding step that offers up to ten topic
 * packs. Each pack is one topic's biggest Squads, top sources and the creators
 * writing about it. "Join" on a pack joins every Squad in it and follows
 * every source and creator; nothing is sent until the user taps the CTA.
 *
 * Start with "00 · Overview and handoff", then walk the states in order.
 *
 * Storybook only: the step, its query and its join hook live next to this
 * story until engineering moves them into the funnel. It is built from the
 * production funnel pieces (glass CTA bar, onboarding headline, rail) and the
 * GraphQL calls are faked with responses captured from production.
 */

interface StepArgs {
  chrome?: OnboardingChromeVariant;
  limit?: number;
}

const topicsHandler = (topics: string[]) =>
  graphql.query('OnboardingTags', () =>
    HttpResponse.json({
      data: { onboardingTags: { tags: topics.map((name) => ({ name })) } },
    }),
  );

const packsHandler = (topics: Record<string, Record<string, unknown>>) =>
  graphql.query('CommunityPacks', ({ variables }) =>
    HttpResponse.json({
      data: Object.fromEntries(
        Object.entries(variables)
          .filter(([name]) => name.startsWith('tag'))
          .flatMap(([name, tag]) => {
            const index = name.replace('tag', '');

            return Object.entries(topics[tag as string] ?? {}).map(
              ([field, value]) => [`${field}${index}`, value],
            );
          }),
      ),
    }),
  );

const onlyTopics = (tags: string[]) =>
  Object.fromEntries(tags.map((tag) => [tag, COMMUNITY_PACK_TOPICS[tag]]));

const joinHandlers = ({
  latency = 600,
  squadsFail = false,
}: { latency?: number | 'infinite'; squadsFail?: boolean } = {}) => [
  squadsFail
    ? graphql.mutation('JoinSquad', async () => {
        await delay(latency);

        return HttpResponse.json({ errors: [{ message: 'Could not join' }] });
      })
    : graphql.mutation('JoinSquad', async ({ variables }) => {
        await delay(latency);

        return HttpResponse.json({
          data: {
            source: {
              id: variables.sourceId,
              handle: variables.sourceId,
              name: variables.sourceId,
              active: true,
              public: true,
            },
          },
        });
      }),
  graphql.mutation('Follow', async () => {
    await delay(latency);

    return HttpResponse.json({ data: { follow: { _: true } } });
  }),
  graphql.mutation('CompleteAction', () =>
    HttpResponse.json({ data: { completeAction: { _: true } } }),
  ),
];

const defaultHandlers = [
  topicsHandler(SUGGESTED_TOPICS),
  packsHandler(COMMUNITY_PACK_TOPICS),
  ...joinHandlers(),
];

const meta: Meta<StepArgs> = {
  title: 'Components/Onboarding/Join communities',
  argTypes: {
    chrome: {
      control: { type: 'inline-radio' },
      options: Object.values(OnboardingChromeVariant),
    },
    limit: { control: { type: 'range', min: 3, max: 12 } },
  },
  args: { chrome: OnboardingChromeVariant.Control, limit: 10 },
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: defaultHandlers },
  },
  beforeEach: () => bootAsUser({ name: 'Ido Shamun', username: 'ido' }),
};

export default meta;

type Story = StoryObj<StepArgs>;

// The step type doesn't exist in the funnel yet, so the shell is handed an
// onboarding step to pick the onboarding background from.
const shellStep = { type: FunnelStepType.EditTags, parameters: {} };

/**
 * What the funnel would receive when the step finishes. A skipped step renders
 * nothing, so without this the skip states would look broken.
 */
const TransitionReport = ({
  children,
}: {
  children: (onTransition: (transition: unknown) => void) => ReactElement;
}): ReactElement => {
  const [transition, setTransition] = useState<unknown>();

  return (
    <div className="flex min-h-dvh flex-col">
      {!!transition && (
        <div className="flex flex-col gap-1 bg-surface-float px-6 py-3">
          <span className="font-bold text-text-primary typo-footnote">
            The step finished and handed this to the funnel:
          </span>
          <code className="break-all text-text-tertiary typo-footnote">
            {JSON.stringify(transition)}
          </code>
        </div>
      )}
      <div className="flex flex-1 flex-col">{children(setTransition)}</div>
    </div>
  );
};

const Step = ({
  chrome,
  limit,
  wrap = (step) => step,
}: StepArgs & { wrap?: (step: ReactNode) => ReactNode }): ReactElement => (
  <TransitionReport>
    {(onTransition) => (
      <FunnelStepShell chrome={chrome} step={shellStep} stepIndex={4} fullWidth>
        {wrap(
          <FunnelCommunities
            onTransition={onTransition}
            parameters={{ limit }}
          />,
        )}
      </FunnelStepShell>
    )}
  </TransitionReport>
);

// A user who skipped the tag step: every pack comes from the suggested topics.
const WithoutPickedTopics = ({
  children,
}: PropsWithChildren): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const key = getFeedSettingsQueryKey(user);
    // The shell seeds picked tags and can re-seed them later, so the override
    // is re-applied whenever the cache changes.
    const clearPickedTags = () => {
      const data = client.getQueryData<FeedSettingsData>(key);

      if (data?.feedSettings?.includeTags?.length) {
        client.setQueryData<FeedSettingsData>(key, {
          ...data,
          feedSettings: { ...data.feedSettings, includeTags: [] },
        });
      }
    };

    clearPickedTags();
    setIsReady(true);

    return client.getQueryCache().subscribe(clearPickedTags);
  }, [client, user]);

  return isReady ? <>{children}</> : null;
};

// The app retries a failed query three times (about 7s) and pauses retries
// while the window is unfocused; the story shows the outcome straight away.
const WithoutRetries = ({ children }: PropsWithChildren): ReactElement => {
  const client = useQueryClient();

  client.setQueryDefaults(['community_packs'], { retry: false });

  return <>{children}</>;
};

const joinPacks = async (canvasElement: HTMLElement, titles: string[]) => {
  const canvas = within(canvasElement);

  for (const title of titles) {
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: `Join the ${title} pack` },
        { timeout: 15000 },
      ),
    );
  }

  return canvas;
};

const tapContinue = async (canvas: ReturnType<typeof within>) =>
  userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

const storyDocs = (story: string) => ({ docs: { description: { story } } });

/* ---------------------------------------------------------------------------
 * 00 · Overview and handoff
 * ------------------------------------------------------------------------- */

const Section = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>): ReactElement => (
  <section className="flex flex-col gap-3">
    <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
    {children}
  </section>
);

const Table = ({ rows }: { rows: Array<[string, ReactNode]> }) => (
  <dl className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
    {rows.map(([term, detail]) => (
      <div
        key={term}
        className="flex flex-col gap-1 px-4 py-3 tablet:flex-row tablet:gap-4"
      >
        <dt className="shrink-0 font-bold text-text-primary typo-callout tablet:w-44">
          {term}
        </dt>
        <dd className="text-text-secondary typo-callout">{detail}</dd>
      </div>
    ))}
  </dl>
);

const Checklist = ({ items }: { items: ReactNode[] }) => (
  <ol className="flex list-decimal flex-col gap-2 pl-5 text-text-secondary typo-callout">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ol>
);

const Code = ({ children }: PropsWithChildren): ReactElement => (
  <code className="rounded-6 bg-surface-float px-1 font-mono typo-footnote">
    {children}
  </code>
);

export const Overview: Story = {
  name: '00 · Overview and handoff',
  parameters: storyDocs(
    'Everything the team needs to build the step: what it does, the row anatomy, copy, states, data rules and the funnel checklist. The phone on the left is the real step.',
  ),
  render: ({ chrome }) => (
    <div className="min-h-dvh bg-background-default px-6 py-10 text-text-primary">
      <div className="mx-auto flex max-w-[76rem] flex-col gap-10 laptop:flex-row laptop:items-start">
        <div className="flex shrink-0 flex-col gap-2 laptop:sticky laptop:top-10">
          <span className="text-text-tertiary typo-footnote">
            Live preview · tap Join on a pack
          </span>
          <div className="h-[48.75rem] w-[24.375rem] overflow-y-auto rounded-24 border border-border-subtlest-secondary">
            <FunnelStepShell
              chrome={chrome}
              step={shellStep}
              stepIndex={4}
              fullWidth
            >
              <FunnelCommunities
                onTransition={() => undefined}
                parameters={{}}
              />
            </FunnelStepShell>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <header className="flex flex-col gap-2">
            <span className="font-bold text-text-tertiary typo-footnote">
              Signup onboarding · new step
            </span>
            <h1 className="font-bold typo-title1">Join communities</h1>
            <p className="text-text-secondary typo-body">
              The tag step tells us <em>what</em> a new developer wants to read.
              This step turns that into <em>who</em> they read it with: packs
              built from those exact tags, each one a topic&apos;s top Squads,
              sources and the developers writing about it. Join three and the
              first feed opens full, personal and already social.
            </p>
            <p className="text-text-secondary typo-body">
              <strong className="text-text-primary">Goal:</strong> more new
              users following communities on day one.{' '}
              <strong className="text-text-primary">Metric:</strong> joins per
              new signup and 7-day retention of those follows, not only CTA
              clicks.
            </p>
          </header>

          <Section title="Positioning and story">
            <Table
              rows={[
                [
                  'The promise',
                  'daily.dev is where developers keep up together. On day one that only works if the feed already has people and places in it, not just articles.',
                ],
                [
                  'Why packs',
                  'A new user knows topics, not Squads or creators. A pack lets them say "I am into React" once and get the right communities for it, with no searching.',
                ],
                [
                  'Why it feels trustworthy',
                  'Every pack is visibly built from their own choices: the explainer names the tags they picked, and the list opens with a "From your tags" section. Nothing looks random or sponsored.',
                ],
                [
                  'Why three',
                  'It mirrors the tag step, which asks for five tags: a small, explained minimum guarantees a real feed without forcing everything. Fewer than three packs available lowers the bar to what exists.',
                ],
                [
                  'Tone',
                  'Plain developer voice, no hype: "Find your communities", "Built from the tags you picked", "Join". It frames a pack as a community (Squads, sources and the developers in them), never as "content".',
                ],
              ]}
            />
          </Section>

          <Section title="Row anatomy">
            <Table
              rows={[
                [
                  'Cover',
                  'A square of four member faces, two by two, each on a solid tile so transparent logos never show through, with no tray behind them. Aligned to the top of the row so it sits next to the title. Square on purpose: it keeps a clear gap to the title on a phone. Story 15 compares it with a stacked pack and a shingle.',
                ],
                [
                  'Title',
                  'The topic name from the backend keyword title, e.g. "Machine Learning". Wraps to two lines, never truncates to one.',
                ],
                [
                  'Followers',
                  'Right under the title, one even weight: "54.7K followers" in Callout, medium weight, secondary colour. Squad members plus source followers across the pack; people in two count twice, so it reads as reach, not a head count.',
                ],
                [
                  'Names (subtitle)',
                  'Every Squad, source and developer in the pack by name, in small tertiary text, the cover faces first, up to two lines, e.g. "Learn JavaScript, Medium, Ido Shamun, daily.dev World…". A Squad named after the topic is skipped so it never repeats the title.',
                ],
                [
                  'Join button',
                  '"Join". Tapped, it turns into "✓ Joined"; tapping again undoes it. Joining is staged and only sent when the user taps Continue.',
                ],
              ]}
            />
          </Section>

          <Section title="Copy">
            <Table
              rows={[
                ['Headline', 'Find your communities'],
                [
                  'Explainer',
                  "Built from the tags you picked: JavaScript, React, DevOps and 2 more. Each pack brings a topic's top Squads, sources and the developers writing about it.",
                ],
                [
                  'Explainer, no tags picked',
                  "Here are the topics developers join most. Each pack brings a topic's top Squads, sources and the developers writing about it.",
                ],
                [
                  'Section headers',
                  'From your tags · Popular with developers (no tags picked: Most joined)',
                ],
                [
                  'Progress, above the CTA',
                  "Join 3 packs to continue → Join 2 more to continue → Join 1 more to continue → ✓ You're all set. Join more anytime.",
                ],
                ['Row button', 'Join → ✓ Joined'],
                ['CTA', 'Continue (disabled until 3 packs are joined)'],
              ]}
            />
            <p className="text-text-tertiary typo-footnote">
              Headline, explainer, CTA and the minimum (3) can each be
              overridden from Freyja parameters, like every other onboarding
              step.
            </p>
          </Section>

          <Section title="States and use cases">
            <Table
              rows={[
                [
                  '01 · Default',
                  'A new user who picked topics on the tag step. "From your tags" first, then "Popular with developers".',
                ],
                [
                  '02 · Two joined',
                  'Rows say Joined, the progress reads "Join 1 more to continue", Continue stays disabled.',
                ],
                [
                  '03 · Ready',
                  'Three joined: "✓ You\'re all set. Join more anytime." and Continue unlocks.',
                ],
                [
                  '04 · Joining',
                  'Continue tapped: the button spins until every join finishes.',
                ],
                [
                  '05 · Done',
                  'All joins succeeded; the funnel gets the joined Squads, sources and creators.',
                ],
                [
                  '06 · Some joins fail',
                  'A failed join never blocks the funnel; it moves on with what succeeded.',
                ],
                [
                  '07 · Loading',
                  'Skeleton rows shaped like real rows while packs load.',
                ],
                [
                  '08 · No topics picked',
                  'User skipped the tag step: one "Most joined" section and the no-tags explainer.',
                ],
                [
                  '09 · Only two packs',
                  'Fewer packs than the minimum: the bar drops to 2 so the user is never stuck.',
                ],
                [
                  '10 · Nothing to recommend',
                  'No pack qualifies: the step skips itself instead of showing an empty list.',
                ],
                [
                  '11 · Packs fail to load',
                  'The query errors: the step skips itself.',
                ],
                [
                  '12–14',
                  'Light theme, small phone (320px) and the onboarding chrome experiment arm.',
                ],
                [
                  '15 · Cover options',
                  'The square cover as a 2×2 gallery (default), a stacked pack and a shingle, side by side.',
                ],
              ]}
            />
          </Section>

          <Section title="Where the packs come from">
            <Table
              rows={[
                [
                  'Topics',
                  <>
                    The user&apos;s picked tags first, then the onboarding tag
                    list, up to 10 + 4 spare. Packs with fewer than 5 members
                    are dropped, so the spares fill the gap.
                  </>,
                ],
                [
                  'One request',
                  <>
                    <Code>CommunityPacks</Code>, one aliased GraphQL query for
                    every topic: <Code>keyword</Code> (title),{' '}
                    <Code>searchSources</Code> + <Code>sourcesByTag</Code>{' '}
                    (Squads, biggest first), <Code>sourcesByTag</Code> (sources)
                    and <Code>topCreatorsByTag</Code> (creators). Checked
                    against production: 14 topics in about 0.9s.
                  </>,
                ],
                [
                  'Pack rules',
                  'Up to 3 Squads, 3 sources and 3 creators per pack, interleaved. Anything already in an earlier pack is skipped, so packs never repeat a face. Personal user sources are left out.',
                ],
                [
                  'Joining',
                  'Staged locally, sent on the CTA: one joinSource per Squad and one follow per source and creator, all in parallel. Failures are dropped, never retried, never blocking.',
                ],
                [
                  'Funnel output',
                  <>
                    Complete transition with{' '}
                    <Code>{'{ packs, squads, sources, users }'}</Code> (ids);
                    skip transition only when nothing qualifies (there is no
                    skip button: the step asks for three packs, like the tag
                    step asks for five tags).
                  </>,
                ],
                [
                  'Analytics',
                  'Squad joins log "complete joining squad" and follows log "follow", both with origin "onboarding".',
                ],
              ]}
            />
          </Section>

          <Section title="Engineering checklist">
            <Checklist
              items={[
                <>
                  Move <Code>FunnelCommunities</Code>,{' '}
                  <Code>CommunityPackRow</Code>, <Code>HandCover</Code>,{' '}
                  <Code>packSelection</Code>, <Code>useJoinCommunities</Code>{' '}
                  and <Code>communityPacks</Code> from this Storybook folder
                  into <Code>packages/shared/src/features/onboarding</Code>.
                </>,
                <>
                  Add <Code>FunnelStepType.Communities</Code> and its step type
                  to the <Code>FunnelStep</Code> union in{' '}
                  <Code>types/funnel.ts</Code>.
                </>,
                <>
                  Register it in <Code>FunnelStepper</Code>&apos;s step map and
                  wrap it with <Code>withIsActiveGuard</Code>.
                </>,
                <>
                  Add it to <Code>onboardingSteps</Code> in{' '}
                  <Code>FunnelStepBackground</Code> and to{' '}
                  <Code>stepsFullWidthOnboarding</Code>, or it gets the paid
                  funnel background and a clamped column.
                </>,
                <>
                  Add a <Code>RequestKey</Code> for the pack query instead of
                  the story&apos;s string key.
                </>,
                'Place the step after the tag step in the Freyja onboarding config. Freyja is the only gate, so no feature flag is needed.',
                'Tests: Continue stays disabled until the minimum is joined; joining packs and continuing sends the right members; leaving a pack removes them; an empty result skips the step.',
              ]}
            />
          </Section>

          <Section title="Asks for the backend">
            <Checklist
              items={[
                'An onboardingPacks(tags) resolver, so ranking and curation live on the server and the client stops composing four fields per topic.',
                'A bulk join/follow mutation: today a three-pack pick fires about 27 requests.',
              ]}
            />
          </Section>

          <Section title="Open questions">
            <Checklist
              items={[
                'Pack size: 9 per pack is a lot for a brand-new feed. Threads dropped bulk-follow because users who were not pushed into it used the app more. 5 or 6 per pack is one constant to change.',
                'Should packs be curated by us instead of built from tags? Curated packs would let us control quality and rotate who is featured.',
                'With no skip button the step is required, like the tag step. If that hurts completion, a quiet skip can come back as a Freyja parameter.',
                'If the pack query fails, the app retries three times (about 7 seconds of skeletons) before the step skips itself. One retry is probably enough during onboarding.',
              ]}
            />
          </Section>
        </div>
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
 * States
 * ------------------------------------------------------------------------- */

export const Default: Story = {
  name: '01 · Default',
  parameters: storyDocs(
    'A new user who picked JavaScript, React, DevOps, AI and Web Development on the tag step. The explainer names those tags, "From your tags" comes first, then "Popular with developers". Continue is disabled until 3 packs are joined.',
  ),
  render: (args) => <Step {...args} />,
};

export const PacksJoined: Story = {
  name: '02 · Two joined',
  parameters: storyDocs(
    'JavaScript and DevOps joined. The line above the CTA reads "Join 1 more to continue" and Continue stays disabled, the same pattern as the tag step\'s minimum. Tap Joined to undo.',
  ),
  render: (args) => <Step {...args} />,
  play: async ({ canvasElement }) => {
    await joinPacks(canvasElement, ['JavaScript', 'DevOps']);
  },
};

export const Ready: Story = {
  name: '03 · Ready',
  parameters: storyDocs(
    'Three packs joined: the progress line turns green, "✓ You\'re all set. Join more anytime.", and Continue unlocks.',
  ),
  render: (args) => <Step {...args} />,
  play: async ({ canvasElement }) => {
    await joinPacks(canvasElement, ['JavaScript', 'React', 'DevOps']);
  },
};

export const Joining: Story = {
  name: '04 · Joining',
  parameters: {
    ...storyDocs(
      'Continue tapped while the joins are in flight: the button shows a spinner until they finish.',
    ),
    msw: {
      handlers: [
        topicsHandler(SUGGESTED_TOPICS),
        packsHandler(COMMUNITY_PACK_TOPICS),
        ...joinHandlers({ latency: 'infinite' }),
      ],
    },
  },
  render: (args) => <Step {...args} />,
  play: async ({ canvasElement }) => {
    await tapContinue(
      await joinPacks(canvasElement, ['JavaScript', 'React', 'DevOps']),
    );
  },
};

export const Done: Story = {
  name: '05 · Done',
  parameters: storyDocs(
    'Every join succeeded. The bar at the top shows what the funnel receives: the joined pack topics plus the Squad, source and creator ids.',
  ),
  render: (args) => <Step {...args} />,
  play: async ({ canvasElement }) => {
    await tapContinue(
      await joinPacks(canvasElement, ['JavaScript', 'React', 'DevOps']),
    );
  },
};

export const SomeJoinsFail: Story = {
  name: '06 · Some joins fail',
  parameters: {
    ...storyDocs(
      'Every Squad join fails here, but the step still completes: sources and creators are followed and "squads" comes back empty. A join error never strands a new user.',
    ),
    msw: {
      handlers: [
        topicsHandler(SUGGESTED_TOPICS),
        packsHandler(COMMUNITY_PACK_TOPICS),
        ...joinHandlers({ squadsFail: true }),
      ],
    },
  },
  render: (args) => <Step {...args} />,
  play: async ({ canvasElement }) => {
    await tapContinue(
      await joinPacks(canvasElement, ['JavaScript', 'React', 'DevOps']),
    );
  },
};

export const Loading: Story = {
  name: '07 · Loading',
  parameters: {
    ...storyDocs(
      'While packs load, skeleton rows keep the real row shape (cover, title, names, followers, button) so nothing jumps when they land.',
    ),
    msw: {
      handlers: [
        topicsHandler(SUGGESTED_TOPICS),
        graphql.query('CommunityPacks', async () => {
          await delay('infinite');

          return HttpResponse.json({});
        }),
      ],
    },
  },
  render: (args) => <Step {...args} />,
};

export const NoTopicsPicked: Story = {
  name: '08 · No topics picked',
  parameters: storyDocs(
    'A user who skipped the tag step. One "Most joined" section built from the suggested onboarding topics (Python, Machine Learning, Security…) and the no-tags explainer, so the step never claims to know tags it does not have.',
  ),
  render: (args) => (
    <Step
      {...args}
      wrap={(step) => <WithoutPickedTopics>{step}</WithoutPickedTopics>}
    />
  ),
};

export const FewPacks: Story = {
  name: '09 · Only two packs',
  parameters: {
    ...storyDocs(
      'Only two topics have enough members for a pack, fewer than the minimum of three. The bar drops to what exists ("Join 2 packs to continue"), so the user is never stuck.',
    ),
    msw: {
      handlers: [
        topicsHandler(SUGGESTED_TOPICS),
        packsHandler(onlyTopics(['javascript', 'react'])),
        ...joinHandlers(),
      ],
    },
  },
  render: (args) => <Step {...args} />,
};

export const NothingToRecommend: Story = {
  name: '10 · Nothing to recommend',
  parameters: {
    ...storyDocs(
      'No topic has enough members for a pack. The step skips itself instead of showing an empty list; the bar at the top shows the skip.',
    ),
    msw: {
      handlers: [topicsHandler(SUGGESTED_TOPICS), packsHandler({})],
    },
  },
  render: (args) => <Step {...args} />,
};

export const PacksFailToLoad: Story = {
  name: '11 · Packs fail to load',
  parameters: {
    ...storyDocs(
      'The pack query errors. The step skips itself (in the app after three quick retries, about 7 seconds), so a backend problem never blocks onboarding.',
    ),
    msw: {
      handlers: [
        topicsHandler(SUGGESTED_TOPICS),
        graphql.query('CommunityPacks', () =>
          HttpResponse.json({ errors: [{ message: 'Unavailable' }] }),
        ),
      ],
    },
  },
  render: (args) => (
    <Step {...args} wrap={(step) => <WithoutRetries>{step}</WithoutRetries>} />
  ),
};

export const LightTheme: Story = {
  name: '12 · Light theme',
  parameters: {
    ...storyDocs('The default state in light mode.'),
    themes: { themeOverride: 'light' },
  },
  render: (args) => <Step {...args} />,
  play: async ({ canvasElement }) => {
    await joinPacks(canvasElement, ['React']);
  },
};

export const SmallPhone: Story = {
  name: '13 · Small phone (320px)',
  parameters: storyDocs(
    'The narrowest phone width. Long titles like "Mobile Development" wrap to two lines and the Join button keeps its size.',
  ),
  render: (args) => (
    <div className="mx-auto w-80 border-x border-border-subtlest-tertiary">
      <Step {...args} />
    </div>
  ),
};

export const AuraChrome: Story = {
  name: '14 · Onboarding chrome experiment',
  args: { chrome: OnboardingChromeVariant.Aura },
  parameters: storyDocs(
    'The "aura" arm of the live onboarding_chrome experiment: animated edge frame and progress dots under the CTA. The step needs no changes for it.',
  ),
  render: (args) => <Step {...args} />,
};

/* ---------------------------------------------------------------------------
 * Cover options
 * ------------------------------------------------------------------------- */

const COVER_TOPICS = ['javascript', 'react', 'devops', 'webdev'];

const coverPacks = buildCommunityPacks(
  COVER_TOPICS,
  Object.fromEntries(
    COVER_TOPICS.flatMap((tag, index) =>
      Object.entries(COMMUNITY_PACK_TOPICS[tag]).map(([field, value]) => [
        `${field}${index}`,
        value,
      ]),
    ),
  ) as Parameters<typeof buildCommunityPacks>[1],
  COVER_TOPICS.length,
);

const COVER_OPTIONS: Array<{
  variant: PackCoverVariant;
  name: string;
  note: string;
}> = [
  {
    variant: 'gallery',
    name: 'Gallery 2×2 (default)',
    note: 'Four whole faces on a tray, nothing overlaps. Clearest and calmest.',
  },
  {
    variant: 'stack',
    name: 'Stacked pack',
    note: 'The lead card in front, two squared up behind. Reads most like a pack; shows one face fully.',
  },
  {
    variant: 'shingle',
    name: 'Shingle',
    note: 'Four tiles laid diagonally, each over the last. Playful; the back faces are partly covered.',
  },
];

const CoverColumn = ({
  variant,
  name,
  note,
}: (typeof COVER_OPTIONS)[number]): ReactElement => {
  const [joined, setJoined] = useState<string[]>([coverPacks[1]?.tag]);

  return (
    <figure className="flex w-full max-w-[24.375rem] flex-col gap-3">
      <figcaption className="flex flex-col gap-1">
        <span className="font-bold text-text-primary typo-title3">{name}</span>
        <span className="text-text-secondary typo-callout">{note}</span>
      </figcaption>
      <ul className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary px-4">
        {coverPacks.map((pack) => (
          <CommunityPackRow
            key={pack.tag}
            cover={variant}
            isJoined={joined.includes(pack.tag)}
            onToggle={() =>
              setJoined((current) =>
                current.includes(pack.tag)
                  ? current.filter((tag) => tag !== pack.tag)
                  : [...current, pack.tag],
              )
            }
            pack={pack}
          />
        ))}
      </ul>
    </figure>
  );
};

export const CoverOptions: Story = {
  name: '15 · Cover options',
  parameters: storyDocs(
    'The square cover three ways, in the real row at phone width. React starts joined in each column to show the joined state; tap Join to compare.',
  ),
  render: () => (
    <div className="min-h-dvh bg-background-default px-6 py-10">
      <div className="mx-auto flex max-w-[78rem] flex-wrap justify-center gap-10">
        {COVER_OPTIONS.map((option) => (
          <CoverColumn key={option.variant} {...option} />
        ))}
      </div>
    </div>
  ),
};
