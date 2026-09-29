import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  MedalBadgeIcon,
  ReputationLightningIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';

/* ── mock data (shapes match the leaderboard API) ───────────────────── */

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
    quests: 188,
  },
  {
    name: 'Nimrod Kramer',
    username: 'nimrod',
    image:
      'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
    rep: 54300,
    quests: 164,
  },
  {
    name: 'Ido Shamun',
    username: 'idoshamun',
    image:
      'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
    rep: 48900,
    quests: 151,
  },
  {
    name: 'Chris Bongers',
    username: 'dailydevtips',
    image:
      'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
    rep: 41200,
    quests: 143,
  },
];

const VIEWER = {
  name: 'Tomer Redlich',
  username: 'tomer',
  image:
    'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
  rep: 12420,
  quests: 63,
  rank: 412,
};

const TOTAL_PARTICIPANTS = 90000;
const TOTAL_QUESTS = 90000;

/** Weekly completions, oldest first — a plain series, no API for it yet. */
const WEEKLY = [320, 410, 380, 520, 610, 570, 780, 690, 860, 940, 880, 1020];

const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${n}`;

const podiumRing = [
  'ring-accent-cheese-default',
  'ring-text-secondary',
  'ring-accent-bun-default',
];

const Avatar = ({
  person,
  size = 40,
  ring,
}: {
  person: Person | typeof VIEWER;
  size?: number;
  ring?: string;
}) => (
  <Tooltip content={person.name}>
    <img
      src={person.image}
      alt={person.name}
      loading="lazy"
      className={
        ring
          ? `shrink-0 rounded-max object-cover ring-2 ${ring}`
          : 'shrink-0 rounded-max object-cover'
      }
      style={{ width: size, height: size }}
    />
  </Tooltip>
);

const Frame = ({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5">
      <Typography type={TypographyType.Subhead} bold>
        {label}
      </Typography>
      <Typography
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    </div>
    <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
      Community pulse
    </Typography>
    {children}
  </section>
);

const Cell = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex flex-col gap-3 rounded-14 bg-background-subtle p-4 ${
      className ?? ''
    }`}
  >
    {children}
  </div>
);

const Counter = ({ value, label }: { value: string; label: string }) => (
  <div className="flex min-w-0 flex-col">
    <Typography type={TypographyType.Title2} bold className="tabular-nums">
      {value}
    </Typography>
    <Typography
      type={TypographyType.Subhead}
      color={TypographyColor.Tertiary}
      className="truncate"
    >
      {label}
    </Typography>
  </div>
);

/* ── Idea 1 — Podium ────────────────────────────────────────────────── */

const Podium = () => {
  const [first, second, third] = PEOPLE;
  const steps = [
    { person: second, height: 'h-16', place: 2 },
    { person: first, height: 'h-24', place: 1 },
    { person: third, height: 'h-12', place: 3 },
  ];

  return (
    <Frame
      label="Idea 1 — Podium"
      note="The top three get a real podium; everyone else is a compact list."
    >
      <Cell>
        <div className="grid grid-cols-3 items-end gap-3">
          {steps.map(({ person, height, place }) => (
            <div key={person.username} className="flex flex-col items-center gap-2">
              <Avatar person={person} size={place === 1 ? 56 : 44} ring={podiumRing[place - 1]} />
              <Typography
                type={TypographyType.Subhead}
                bold
                className="w-full truncate text-center"
              >
                {person.name}
              </Typography>
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                {compact(person.rep)}
              </Typography>
              <div
                className={`flex w-full items-start justify-center rounded-t-12 bg-overlay-active-cabbage pt-1 ${height}`}
              >
                <Typography type={TypographyType.Title3} bold>
                  {place}
                </Typography>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {PEOPLE.slice(3).map((person, index) => (
            <div
              key={person.username}
              className="flex items-center gap-3 rounded-12 bg-background-default p-2"
            >
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
                className="w-5 tabular-nums"
              >
                {index + 4}
              </Typography>
              <Avatar person={person} size={28} />
              <Typography type={TypographyType.Subhead} bold className="flex-1 truncate">
                {person.name}
              </Typography>
              <Typography type={TypographyType.Subhead} className="tabular-nums">
                {compact(person.rep)}
              </Typography>
            </div>
          ))}
        </div>
      </Cell>
    </Frame>
  );
};

/* ── Idea 2 — You are here ──────────────────────────────────────────── */

const YouAreHere = () => {
  const percentile = Math.max(
    1,
    Math.round((VIEWER.rank / TOTAL_PARTICIPANTS) * 100),
  );

  return (
    <Frame
      label="Idea 2 — You are here"
      note="Puts the viewer's own standing first, with the leaders as the far end of the scale."
    >
      <Cell>
        <div className="flex items-center gap-3">
          <Avatar person={VIEWER} size={48} ring="ring-accent-cabbage-default" />
          <div className="flex min-w-0 flex-1 flex-col">
            <Typography type={TypographyType.Title3} bold>
              #{VIEWER.rank.toLocaleString()}
            </Typography>
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              Top {percentile}% by reputation
            </Typography>
          </div>
          <Counter value={compact(VIEWER.rep)} label="your reputation" />
        </div>

        {/* Position along the whole field, leaders pinned at the top end. */}
        <div className="flex flex-col gap-2">
          <div className="relative h-2 rounded-max bg-background-default">
            <div
              className="absolute inset-y-0 left-0 rounded-max bg-accent-cabbage-default"
              style={{ width: `${100 - percentile}%` }}
            />
            <span
              className="absolute -top-1 size-4 rounded-max bg-accent-cabbage-default ring-2 ring-background-subtle"
              style={{ left: `calc(${100 - percentile}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              You
            </Typography>
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              {compact(PEOPLE[0].rep)} — {PEOPLE[0].name}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
          >
            Ahead of you
          </Typography>
          <div className="flex -space-x-2">
            {PEOPLE.slice(0, 5).map((person) => (
              <Avatar key={person.username} person={person} size={28} />
            ))}
          </div>
        </div>
      </Cell>
    </Frame>
  );
};

/* ── Idea 3 — Ticker ────────────────────────────────────────────────── */

const FEED = [
  { person: PEOPLE[0], quest: 'To the back of the queue', when: '2m' },
  { person: PEOPLE[3], quest: 'Read 100 posts', when: '11m' },
  { person: PEOPLE[1], quest: "I'll Get to It Any Day Now", when: '24m' },
  { person: PEOPLE[4], quest: 'Maintain a 7-day streak', when: '38m' },
  { person: PEOPLE[2], quest: 'Upvote 200 posts', when: '1h' },
];

const Ticker = () => (
  <Frame
    label="Idea 3 — Ticker"
    note="A live stream of completions. Highest information density; needs a recent-activity endpoint."
  >
    <Cell>
      <div className="flex items-baseline justify-between gap-3">
        <Counter value={compact(TOTAL_QUESTS)} label="quests completed all-time" />
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          Live
        </Typography>
      </div>
      <div className="flex flex-col">
        {FEED.map((row, index) => (
          <div
            key={`${row.person.username}-${index.toString()}`}
            className="flex items-center gap-3 border-b border-border-subtlest-tertiary py-2 last:border-b-0"
          >
            <Avatar person={row.person} size={28} />
            <Typography type={TypographyType.Subhead} className="min-w-0 flex-1 truncate">
              <b>{row.person.name}</b> completed {row.quest}
            </Typography>
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Quaternary}
              className="tabular-nums"
            >
              {row.when}
            </Typography>
          </div>
        ))}
      </div>
    </Cell>
  </Frame>
);

/* ── Idea 4 — Two races ─────────────────────────────────────────────── */

const RaceColumn = ({
  title,
  icon,
  people,
  metric,
}: {
  title: string;
  icon: React.ReactNode;
  people: Person[];
  metric: (p: Person) => number;
}) => {
  const max = Math.max(...people.map(metric));

  return (
    <Cell>
      <div className="flex items-center gap-1.5">
        {icon}
        <Typography type={TypographyType.Subhead} bold>
          {title}
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        {people.slice(0, 5).map((person, index) => (
          <div key={person.username} className="flex items-center gap-2">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
              className="w-4 tabular-nums"
            >
              {index + 1}
            </Typography>
            <Avatar person={person} size={24} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <Typography type={TypographyType.Subhead} className="truncate">
                  {person.name}
                </Typography>
                <Typography
                  type={TypographyType.Subhead}
                  bold
                  className="tabular-nums"
                >
                  {compact(metric(person))}
                </Typography>
              </div>
              <div className="h-1.5 rounded-max bg-background-default">
                <div
                  className="h-full rounded-max bg-accent-cabbage-default"
                  style={{ width: `${(metric(person) / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Cell>
  );
};

const TwoRaces = () => (
  <Frame
    label="Idea 4 — Two races"
    note="Ranked bars instead of avatar rails, so relative distance is readable at a glance."
  >
    <div className="grid gap-2 tablet:grid-cols-2">
      <RaceColumn
        title="Top reputation"
        icon={
          <ReputationLightningIcon
            secondary
            size={IconSize.Size16}
            className="text-accent-onion-default"
          />
        }
        people={PEOPLE}
        metric={(p) => p.rep}
      />
      <RaceColumn
        title="Most quests"
        icon={
          <MedalBadgeIcon
            size={IconSize.Size16}
            className="text-accent-cheese-default"
          />
        }
        people={[...PEOPLE].sort((a, b) => b.quests - a.quests)}
        metric={(p) => p.quests}
      />
    </div>
  </Frame>
);

/* ── Idea 5 — Momentum band ─────────────────────────────────────────── */

const MomentumBand = () => {
  const max = Math.max(...WEEKLY);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Frame
      label="Idea 5 — Momentum band"
      note="Leads with scale and trend rather than ranking; the avatar wall shows breadth, not order."
    >
      <Cell>
        <div className="grid gap-4 tablet:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
          <div className="flex flex-col gap-1">
            <Counter
              value={compact(TOTAL_QUESTS)}
              label="quests completed all-time"
            />
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.StatusSuccess}
              bold
            >
              +16% this week
            </Typography>
          </div>
          {/* Weekly completions. No endpoint for this series yet. */}
          <div className="flex h-20 items-end gap-1">
            {WEEKLY.map((value, index) => (
              <Tooltip
                key={index.toString()}
                content={`${value.toLocaleString()} completions`}
              >
                <span
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex-1 rounded-4 ${
                    hovered === index
                      ? 'bg-accent-cabbage-bolder'
                      : 'bg-accent-cabbage-default'
                  }`}
                  style={{ height: `${(value / max) * 100}%` }}
                />
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {[...PEOPLE, ...PEOPLE, ...PEOPLE].map((person, index) => (
            <Avatar
              key={`${person.username}-${index.toString()}`}
              person={person}
              size={26}
            />
          ))}
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            className="pl-1"
          >
            and millions of developers
          </Typography>
        </div>
      </Cell>
    </Frame>
  );
};

/* ── stories ────────────────────────────────────────────────────────── */

const queryClient = new QueryClient();

const meta: Meta = {
  title: 'Pages/Community Pulse Ideas',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div id="__next">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const wrap = (node: React.ReactNode) => (
  <div className="mx-auto w-full max-w-[72rem] p-4">{node}</div>
);

export const Idea1Podium: Story = { render: () => wrap(<Podium />) };
export const Idea2YouAreHere: Story = { render: () => wrap(<YouAreHere />) };
export const Idea3Ticker: Story = { render: () => wrap(<Ticker />) };
export const Idea4TwoRaces: Story = { render: () => wrap(<TwoRaces />) };
export const Idea5MomentumBand: Story = {
  render: () => wrap(<MomentumBand />),
};

export const CompareAll: Story = {
  render: () => (
    <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-10 p-4">
      <Podium />
      <YouAreHere />
      <Ticker />
      <TwoRaces />
      <MomentumBand />
    </div>
  ),
};
