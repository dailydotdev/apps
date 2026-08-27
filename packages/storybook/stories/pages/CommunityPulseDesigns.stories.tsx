import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ArrowIcon,
  BookmarkIcon,
  CoreIcon,
  MedalBadgeIcon,
  ReadingStreakIcon,
  ReputationLightningIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { CommunityPulse } from '../../../webapp/components/game-center/CommunityPulse';

/* ── shared mock data (real entries from the leaderboard API) ───────── */

type Person = {
  name: string;
  username: string;
  image: string;
  rep: number;
  quests: number;
};

const PEOPLE: Person[] = [
  {
    name: 'Bobby Iliev',
    username: 'bobbyiliev',
    image: 'https://avatars3.githubusercontent.com/u/21223421?v=4',
    rep: 76550,
    quests: 328,
  },
  {
    name: 'Joud Awad',
    username: 'joudawad',
    image:
      'https://media.daily.dev/image/upload/s--dOB9RaXY--/f_auto/v1773320801/avatars/avatar_iaC4JsBU0lV8wBsc85fSh',
    rep: 74620,
    quests: 210,
  },
  {
    name: 'Randy',
    username: 'randy',
    image:
      'https://media.daily.dev/image/upload/s--UjV4-KkB--/f_auto/v1708097210/avatars/avatar_HXYbbGcBO38Rfv7RrCBdA',
    rep: 69050,
    quests: 198,
  },
  {
    name: 'Ole-Martin',
    username: 'ombratteng',
    image: 'https://avatars.githubusercontent.com/u/1681525?v=4',
    rep: 65260,
    quests: 176,
  },
  {
    name: 'Denis Bolkovskis',
    username: 'denisb0',
    image:
      'https://media.daily.dev/image/upload/s--PGCuYx85--/f_auto,q_auto/v1/avatars/avatar_yRuVFf6IbfTylBjx9Dzvt',
    rep: 56520,
    quests: 155,
  },
  {
    name: 'OrcDev',
    username: 'orcdev',
    image: 'https://avatars.githubusercontent.com/u/7549148?v=4',
    rep: 56390,
    quests: 149,
  },
  {
    name: 'Anja P',
    username: 'anjapcodes',
    image:
      'https://media.daily.dev/image/upload/s--M_c0s8Ky--/f_auto/v1721658650/avatars/avatar_WVJSfJtDe63PxQFAsmXFO',
    rep: 51350,
    quests: 141,
  },
  {
    name: 'Chris Bongers',
    username: 'dailydevtips',
    image:
      'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-',
    rep: 51285,
    quests: 138,
  },
  {
    name: 'Isaac de Andrade',
    username: 'andradei',
    image: 'https://avatars.githubusercontent.com/u/2653546?v=4',
    rep: 51080,
    quests: 132,
  },
  {
    name: 'Fabian Letsch',
    username: 'fabianletsch',
    image:
      'https://lh3.googleusercontent.com/a/ACg8ocKR6BVy_wn23EoOKq7-BlszlcXcLmASlnb7l-GtS-q1bePnkaJf=s96-c',
    rep: 49620,
    quests: 127,
  },
];

const VIEWER = {
  name: 'Tomer Redlich',
  username: 'tomer',
  image:
    'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
  rep: 12420,
  quests: 63,
};

const TRENDING = [
  {
    name: 'To the back of the queue',
    desc: 'Bookmark 1 post',
    count: 15871,
    when: 'All time',
  },
  {
    name: "I'll Get to It Any Day Now",
    desc: 'Bookmark 3 posts',
    count: 534,
    when: 'This week',
  },
];

const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${n}`;

const medalColor = [
  'text-accent-cheese-default',
  'text-text-secondary',
  'text-accent-bun-default',
];

/* ── small shared pieces ────────────────────────────────────────────── */

const Avatar = ({
  person,
  size = 40,
}: {
  person: Person | typeof VIEWER;
  size?: number;
}) => (
  <img
    src={person.image}
    alt={person.name}
    width={size}
    height={size}
    loading="lazy"
    className="shrink-0 rounded-12 object-cover"
    style={{ width: size, height: size }}
  />
);

const Frame = ({
  title,
  desc,
  action,
  children,
}: {
  title: string;
  desc: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-2 laptop:flex-row laptop:items-end laptop:justify-between">
      <div className="flex flex-col gap-1">
        <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {desc}
        </Typography>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const OpenAll = () => (
  <Button
    tag="a"
    href="/users"
    variant={ButtonVariant.Secondary}
    size={ButtonSize.Small}
    icon={<ArrowIcon className="rotate-90" />}
    iconPosition={ButtonIconPosition.Right}
  >
    Open full leaderboards
  </Button>
);

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 ${className}`}
  >
    {children}
  </div>
);

/* ══ 1 · Where you stand ════════════════════════════════════════════ */

const RankRow = ({
  rank,
  person,
  metric,
  isViewer,
}: {
  rank: number;
  person: Person | typeof VIEWER;
  metric: string;
  isViewer?: boolean;
}) => (
  <div
    className={`flex items-center gap-3 rounded-10 px-2 py-1.5 ${
      isViewer ? 'bg-overlay-active-cabbage' : ''
    }`}
  >
    <Typography
      type={TypographyType.Footnote}
      color={isViewer ? TypographyColor.Primary : TypographyColor.Tertiary}
      bold={isViewer}
      className="w-9 shrink-0 tabular-nums"
    >
      #{rank}
    </Typography>
    <Avatar person={person} size={32} />
    <div className="min-w-0 flex-1">
      <Typography type={TypographyType.Footnote} bold className="truncate">
        {isViewer ? 'You' : person.name}
      </Typography>
    </div>
    <Typography type={TypographyType.Footnote} bold className="tabular-nums">
      {metric}
    </Typography>
  </div>
);

const StandingCard = ({
  title,
  unit,
  viewerRank,
  total,
  rows,
}: {
  title: string;
  unit: string;
  viewerRank: number;
  total: number;
  rows: {
    rank: number;
    person: Person | typeof VIEWER;
    metric: string;
    isViewer?: boolean;
  }[];
}) => {
  const percentile = Math.max(1, Math.round((viewerRank / total) * 100));
  return (
    <Card>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <Typography type={TypographyType.Callout} bold>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          top {percentile}%
        </Typography>
      </div>
      <Typography type={TypographyType.Title3} bold>
        #{viewerRank.toLocaleString()}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        of {total.toLocaleString()} by {unit}
      </Typography>
      <div className="mt-2 h-1.5 overflow-hidden rounded-max bg-border-subtlest-tertiary">
        <div
          className="h-full rounded-max bg-accent-cabbage-default"
          style={{ width: `${100 - percentile}%` }}
        />
      </div>
      <div className="mt-3 flex flex-col gap-0.5 border-t border-border-subtlest-tertiary pt-3">
        {rows.map((r) => (
          <RankRow key={r.rank} {...r} />
        ))}
      </div>
    </Card>
  );
};

const DesignOne = () => (
  <Frame
    title="Community pulse"
    desc="A quick look at what the community is up to"
    action={<OpenAll />}
  >
    <div className="grid gap-4 tablet:grid-cols-2">
      <StandingCard
        title="Highest reputation"
        unit="reputation"
        viewerRank={412}
        total={128405}
        rows={[
          { rank: 410, person: PEOPLE[6], metric: compact(12680) },
          { rank: 411, person: PEOPLE[7], metric: compact(12510) },
          {
            rank: 412,
            person: VIEWER,
            metric: compact(VIEWER.rep),
            isViewer: true,
          },
          { rank: 413, person: PEOPLE[8], metric: compact(12290) },
          { rank: 414, person: PEOPLE[9], metric: compact(12140) },
        ]}
      />
      <StandingCard
        title="Most quests completed"
        unit="quests completed"
        viewerRank={1897}
        total={128405}
        rows={[
          { rank: 1895, person: PEOPLE[4], metric: '65' },
          { rank: 1896, person: PEOPLE[5], metric: '64' },
          { rank: 1897, person: VIEWER, metric: '63', isViewer: true },
          { rank: 1898, person: PEOPLE[3], metric: '62' },
          { rank: 1899, person: PEOPLE[2], metric: '61' },
        ]}
      />
    </div>
    <Card className="!py-3">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        <strong className="font-bold text-text-primary">90K</strong> quests
        completed all-time · most completed{' '}
        <strong className="font-bold text-text-primary">
          To the back of the queue
        </strong>{' '}
        (15,871)
      </Typography>
    </Card>
  </Frame>
);

/* ══ 2 · Merge and compact ══════════════════════════════════════════ */

const QuestRow = ({ q }: { q: (typeof TRENDING)[number] }) => (
  <div className="flex items-center gap-3">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-max border-2 border-accent-cabbage-default bg-overlay-active-cabbage text-accent-cabbage-default">
      <BookmarkIcon size={IconSize.Small} />
    </span>
    <div className="min-w-0 flex-1">
      <Typography type={TypographyType.Footnote} bold className="truncate">
        {q.name}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="truncate"
      >
        {q.desc}
      </Typography>
    </div>
    <div className="shrink-0 text-right">
      <Typography type={TypographyType.Footnote} bold className="tabular-nums">
        {q.count.toLocaleString()}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        {q.when}
      </Typography>
    </div>
  </div>
);

const MiniBoard = ({
  title,
  rows,
}: {
  title: string;
  rows: { person: Person; metric: string }[];
}) => (
  <div>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
    >
      {title}
    </Typography>
    <div className="mt-2 flex flex-col gap-2">
      {rows.map((r, i) => (
        <div key={r.person.username} className="flex items-center gap-2.5">
          <MedalBadgeIcon size={IconSize.XSmall} className={medalColor[i]} />
          <Avatar person={r.person} size={26} />
          <Typography
            type={TypographyType.Caption1}
            className="min-w-0 flex-1 truncate"
          >
            {r.person.name}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            bold
            className="tabular-nums"
          >
            {r.metric}
          </Typography>
        </div>
      ))}
    </div>
  </div>
);

const DesignTwo = () => (
  <Frame
    title="Community pulse"
    desc="A quick look at what the community is up to"
    action={
      <div className="flex items-center gap-4">
        <DataTile
          label="Total quests"
          value={90000}
          info="Every completed or claimed quest across the community."
          icon={
            <CoreIcon size={IconSize.Small} className="text-text-tertiary" />
          }
          className={{
            container: '!flex-row items-center gap-2 !border-0 !p-0',
          }}
        />
        <OpenAll />
      </div>
    }
  >
    <div className="grid gap-4 tablet:grid-cols-2">
      <Card>
        <Typography type={TypographyType.Callout} bold>
          Trending quests
        </Typography>
        <div className="mt-3 flex flex-col gap-3">
          {TRENDING.map((q) => (
            <QuestRow key={q.name} q={q} />
          ))}
        </div>
      </Card>
      <Card className="flex flex-col gap-4">
        <MiniBoard
          title="HIGHEST REPUTATION"
          rows={PEOPLE.slice(0, 3).map((p) => ({
            person: p,
            metric: compact(p.rep),
          }))}
        />
        <MiniBoard
          title="MOST QUESTS COMPLETED"
          rows={[PEOPLE[0], PEOPLE[1], PEOPLE[2]].map((p) => ({
            person: p,
            metric: `${p.quests}`,
          }))}
        />
      </Card>
    </div>
  </Frame>
);

/* ══ 3 · One card, tabbed ═══════════════════════════════════════════ */

const TABS = [
  {
    key: 'rep',
    label: 'Reputation',
    unit: 'reputation',
    icon: ReputationLightningIcon,
  },
  { key: 'quests', label: 'Quests', unit: 'quests', icon: CoreIcon },
  {
    key: 'streak',
    label: 'Streak',
    unit: 'day streak',
    icon: ReadingStreakIcon,
  },
] as const;

const DesignThree = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('rep');
  const metricFor = (p: Person) =>
    tab === 'rep'
      ? compact(p.rep)
      : tab === 'quests'
      ? `${p.quests}`
      : `${Math.round(p.quests / 2)}d`;
  const viewerMetric =
    tab === 'rep'
      ? compact(VIEWER.rep)
      : tab === 'quests'
      ? `${VIEWER.quests}`
      : '31d';

  return (
    <Frame
      title="Community pulse"
      desc="A quick look at what the community is up to"
      action={<OpenAll />}
    >
      <Card className="!p-0">
        <div className="flex gap-1 border-b border-border-subtlest-tertiary p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-10 px-3 py-1.5 typo-footnote ${
                tab === t.key
                  ? 'bg-surface-float font-bold text-text-primary'
                  : 'text-text-tertiary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-0.5 p-2">
          {PEOPLE.slice(0, 5).map((p, i) => (
            <div
              key={p.username}
              className="flex items-center gap-3 rounded-10 px-2 py-2"
            >
              <span className="w-6 shrink-0 text-center">
                {i < 3 ? (
                  <MedalBadgeIcon
                    size={IconSize.Small}
                    className={medalColor[i]}
                  />
                ) : (
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                    className="tabular-nums"
                  >
                    {i + 1}
                  </Typography>
                )}
              </span>
              <Avatar person={p} size={32} />
              <div className="min-w-0 flex-1">
                <Typography
                  type={TypographyType.Footnote}
                  bold
                  className="truncate"
                >
                  {p.name}
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="truncate"
                >
                  @{p.username}
                </Typography>
              </div>
              <Typography
                type={TypographyType.Callout}
                bold
                className="tabular-nums"
              >
                {metricFor(p)}
              </Typography>
            </div>
          ))}

          <div className="mt-1 flex items-center gap-3 rounded-10 border-t border-border-subtlest-tertiary bg-overlay-active-cabbage px-2 py-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="w-6 shrink-0 text-center tabular-nums"
            >
              412
            </Typography>
            <Avatar person={VIEWER} size={32} />
            <Typography
              type={TypographyType.Footnote}
              bold
              className="min-w-0 flex-1 truncate"
            >
              You
            </Typography>
            <Typography
              type={TypographyType.Callout}
              bold
              className="tabular-nums"
            >
              {viewerMetric}
            </Typography>
          </div>
        </div>

        <div className="border-t border-border-subtlest-tertiary px-4 py-2.5">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            <strong className="font-bold text-text-primary">90K</strong> quests
            completed all-time · most completed{' '}
            <strong className="font-bold text-text-primary">
              To the back of the queue
            </strong>{' '}
            (15,871)
          </Typography>
        </div>
      </Card>
    </Frame>
  );
};

/* ══ 4 · Ambient pulse ══════════════════════════════════════════════ */

const Counter = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col">
    <Typography type={TypographyType.Title2} bold className="tabular-nums">
      {value}
    </Typography>
    <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
  </div>
);

const DesignFour = () => (
  <Frame
    title="Community pulse"
    desc="A quick look at what the community is up to"
    action={<OpenAll />}
  >
    <Card className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <Counter value="1,284" label="quests completed today" />
        <Counter value="342" label="awards given today" />
        <Counter value="918" label="badges earned this week" />
      </div>

      <div className="flex items-center gap-3 border-t border-border-subtlest-tertiary pt-4">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="shrink-0"
        >
          Top readers
        </Typography>
        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
          {PEOPLE.map((p, i) => (
            <Tooltip
              key={p.username}
              content={`#${i + 1} · ${p.name} · ${compact(p.rep)}`}
            >
              <span className="relative shrink-0">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className={`size-9 rounded-max object-cover ${
                    i < 3 ? 'ring-2 ring-accent-cheese-default' : ''
                  }`}
                />
                {i < 3 && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-max bg-accent-cheese-default px-1 text-[9px] font-black text-black">
                    {i + 1}
                  </span>
                )}
              </span>
            </Tooltip>
          ))}
        </div>
      </div>
    </Card>
  </Frame>
);

/* ── storybook wiring ───────────────────────────────────────────────── */

const queryClient = new QueryClient();

const meta: Meta = {
  title: 'Pages/Community Pulse Designs',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div id="__next">
          <div className="mx-auto w-full max-w-[72rem] p-6">
            <Story />
          </div>
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const OneWhereYouStand: Story = { render: () => <DesignOne /> };
export const TwoMergeAndCompact: Story = { render: () => <DesignTwo /> };
export const ThreeOneCardTabbed: Story = { render: () => <DesignThree /> };
export const FourAmbientPulse: Story = { render: () => <DesignFour /> };

// The real component, wired the way the page wires it.
export const FourAsShipped: Story = {
  render: () => (
    <Frame
      title="Community pulse"
      desc="A quick look at what the community is up to"
      action={<OpenAll />}
    >
      <CommunityPulse
        stats={{
          totalCount: 90000,
          allTimeLeader: {
            questId: '1',
            questName: 'To the back of the queue',
            questDescription: 'Bookmark 1 post',
            count: 15871,
          },
          weeklyLeader: {
            questId: '2',
            questName: "I'll Get to It Any Day Now",
            questDescription: 'Bookmark 3 posts',
            count: 534,
          },
        }}
        highestReputation={
          PEOPLE.map((p, i) => ({
            score: p.rep,
            user: { id: `r${i}`, ...p },
          })) as never
        }
        mostQuestsCompleted={
          PEOPLE.map((p, i) => ({
            score: p.quests,
            user: { id: `q${i}`, ...p },
          })) as never
        }
      />
    </Frame>
  ),
};

export const CompareAll: Story = {
  render: () => (
    <div className="flex flex-col gap-12">
      {[
        ['1 · Where you stand', <DesignOne key="1" />],
        ['2 · Merge and compact', <DesignTwo key="2" />],
        ['3 · One card, tabbed', <DesignThree key="3" />],
        ['4 · Ambient pulse', <DesignFour key="4" />],
      ].map(([label, node]) => (
        <div key={label as string}>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="mb-3 uppercase tracking-[0.14em]"
          >
            {label as string}
          </Typography>
          {node as React.ReactNode}
        </div>
      ))}
    </div>
  ),
};
