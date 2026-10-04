import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ARCADE, FreezeArt } from './rewardArt';
import { FINAL_DAY, weekPlan } from './weekPlan';

// The rules the card is built against, and the two notifications the run is
// allowed to send — as pages rather than as a markdown file only engineers
// read. Everything here mirrors
// `packages/shared/src/features/zeroDayStreak/AGENTS.md`; that file stays the
// source of truth, and if the two ever disagree it is this page that is wrong.

const Panel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5',
      className,
    )}
  >
    {children}
  </div>
);

const Heading = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.H3}
    type={TypographyType.Body}
    color={TypographyColor.Primary}
    bold
  >
    {children}
  </Typography>
);

const Body = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.P}
    type={TypographyType.Callout}
    color={TypographyColor.Tertiary}
  >
    {children}
  </Typography>
);

/** A rule and the reason for it. The reason is the part that stops it drifting. */
const Rule = ({
  rule,
  why,
}: {
  rule: ReactNode;
  why: ReactNode;
}): ReactElement => (
  <li className="flex flex-col gap-1 border-l-2 border-accent-bacon-default pl-4">
    <Typography type={TypographyType.Callout} bold>
      {rule}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {why}
    </Typography>
  </li>
);

const Cell = ({
  children,
  head,
}: {
  children: ReactNode;
  head?: boolean;
}): ReactElement => (
  <td
    className={classNames(
      'border-b border-border-subtlest-tertiary px-4 py-3 align-top',
      head && 'font-bold',
    )}
  >
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      color={head ? TypographyColor.Primary : TypographyColor.Tertiary}
    >
      {children}
    </Typography>
  </td>
);

export const RulesPage = (): ReactElement => (
  <div className="flex max-w-[52rem] flex-col gap-8 bg-background-default p-8">
    <header className="flex flex-col gap-1">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title2}
        color={TypographyColor.Primary}
        bold
      >
        How the run behaves
      </Typography>
      <Body>
        Seven days, one claim a day, gated on reading a post. These are the
        rules the card is drawn against — the full version, with the reasoning,
        lives in{' '}
        <code className="rounded-6 bg-surface-float px-1">
          features/zeroDayStreak/AGENTS.md
        </code>
        .
      </Body>
    </header>

    <Panel>
      <Heading>The two acts</Heading>
      <Body>Almost everything else falls out of keeping these apart.</Body>
      <ul className="mt-4 flex flex-col gap-4">
        <Rule
          rule="Reading keeps the run alive, and advances it."
          why="Opening the app is not the qualifying act. Copy that says “come back” teaches the wrong habit: someone who returns, finds a dead button and leaves has done exactly what we asked."
        />
        <Rule
          rule="Claiming only collects."
          why="Nothing is ever auto-claimed, so an earned reward waits until someone taps it. That is what the first notification exists to say."
        />
        <Rule
          rule="Unclaimed rewards stack, and can be collected out of order."
          why="Someone who read yesterday without tapping opens today with two live claims. Only today wears the lit frame — more than one day can be claimable, but one is today."
        />
      </ul>
    </Panel>

    <Panel>
      <Heading>Week one is failable</Heading>
      <Body>
        A missed day costs the run. This replaced a forgiving model, and it is
        deliberate: the run asks for one thing, so it has to mean it.
      </Body>
      <ul className="mt-4 flex flex-col gap-4">
        <Rule
          rule="A day that ends with no post read spends a banked freeze."
          why="Silently. No dialog, no banner, and no notification either — asking is pointless once the day is gone, and announcing it turns a non-event into something to dismiss."
        />
        <Rule
          rule="With no freeze left, the ladder resets to day 1."
          why="Loss aversion pulls only while you still hold something. That is the risk this takes in exchange for the run meaning something — watch for drop-off starting the day after a reset."
        />
        <Rule
          rule="Claimed Cores and banked freezes survive a reset."
          why="A reset restarts the ladder, not the balance. Taking back a granted reward turns a lapse into a grievance."
        />
        <Rule
          rule="None of this shows on the card."
          why="The card only ever states the present. The notification is the only surface that reaches someone who is not looking at it."
        />
      </ul>
    </Panel>

    <Panel>
      <Heading>An unclaimed day</Heading>
      <Body>Two inputs: was a post read, and has the day ended.</Body>
      <table className="mt-4 w-full border-collapse text-left">
        <thead>
          <tr>
            <Cell head> </Cell>
            <Cell head>Day open</Cell>
            <Cell head>Day ended</Cell>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Cell head>Read</Cell>
            <Cell>Claim is live</Cell>
            <Cell>
              Claim stays live and the run advances anyway. Nothing auto-claims;
              the reward waits for the tap.
            </Cell>
          </tr>
          <tr>
            <Cell head>Not read</Cell>
            <Cell>Claim is visible but dead</Cell>
            <Cell>A freeze is spent, or the ladder resets to day 1.</Cell>
          </tr>
        </tbody>
      </table>
    </Panel>

    <Panel>
      <Heading>The ladder</Heading>
      <Body>
        Cores climbing, with two freeze days breaking it up. It never pays less
        than the day before — a dip reads as a downgrade, and the freeze days
        sit where a dip would otherwise land because they are not the same unit.
      </Body>
      <ol className="mt-4 flex flex-wrap gap-2">
        {weekPlan.map((planned) => (
          <li
            key={planned.day}
            className="flex min-w-[5rem] flex-1 flex-col items-center gap-1 rounded-12 border border-border-subtlest-tertiary px-3 py-2"
          >
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
            >
              Day {planned.day}
            </Typography>
            <Typography type={TypographyType.Callout} bold>
              {planned.amount}
            </Typography>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              {planned.unit}
            </Typography>
          </li>
        ))}
      </ol>
    </Panel>

    <Panel className="border-accent-cheese-default/40">
      <Heading>Open, and deliberately not answered</Heading>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-5">
        {[
          'The card has no “streak at risk” state. Nothing says a missed day costs the run.',
          'The freeze rewards are still the smallest rungs, now that they do real work.',
          'Does a reset take pending unclaimed rewards with it? Assumed yes.',
          'What replaces the run after day 7, when it repeats with possibly different rewards.',
        ].map((item) => (
          <li key={item}>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {item}
            </Typography>
          </li>
        ))}
      </ul>
    </Panel>
  </div>
);

/**
 * A push notification, roughly as an OS draws one.
 *
 * Drawn rather than described because these are the run's only surface for a
 * reset, and copy that reads fine in a bullet can read badly in a 2-line
 * banner with the app name above it.
 */
const PushCard = ({
  title,
  body,
}: {
  title: string;
  body: string;
}): ReactElement => (
  <div
    className="flex w-full min-w-0 max-w-[26rem] items-start gap-3 rounded-16 p-3"
    style={{ background: ARCADE.surfaceRaised }}
  >
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-10"
      style={{ background: ARCADE.streak }}
    >
      <FreezeArt sizeClass="size-6" />
    </span>
    <span
      className="flex flex-col gap-0.5"
      style={{ minWidth: 0, flex: '1 1 0%', overflowWrap: 'anywhere' }}
    >
      <span
        className="typo-caption2 uppercase tracking-wide"
        style={{ color: ARCADE.ink50 }}
      >
        daily.dev · now
      </span>
      <span
        className="break-words font-bold typo-callout"
        style={{ color: ARCADE.ink100 }}
      >
        {title}
      </span>
      <span
        className="break-words typo-footnote"
        style={{ color: ARCADE.ink70 }}
      >
        {body}
      </span>
    </span>
  </div>
);

const NOTIFICATIONS: Array<{
  name: string;
  title: string;
  body: string;
  trigger: string;
  why: string;
}> = [
  {
    name: '1 · A reward is waiting',
    title: 'Your day 3 reward is waiting',
    body: 'You read today — claim it before the day ends.',
    trigger:
      'A qualifying post was read and the day’s reward is still uncollected, some hours later and before the day ends. Once per day.',
    why: 'Nothing auto-claims, so an earned reward is invisible until the card is opened — and the person has already done the hard part.',
  },
  {
    name: '1b · …and when they have piled up',
    title: '3 rewards are waiting',
    body: 'You have earned them. Claim them whenever you like.',
    trigger:
      'The same notification, counting. Rewards stack, so the count is the only part that varies.',
    why: 'A second notification for stacking would be a third notification in a run that is allowed two.',
  },
  {
    name: '2 · The week restarted',
    title: 'Your reading week restarted',
    body: 'No post was read yesterday, so the run is back at day 1. Today’s reward is ready.',
    trigger:
      'A day ended with no post read AND no freeze to cover it, so the ladder reset. Never fires when a freeze covered the day — that stays silent.',
    why: 'The only surface a reset has. Say nothing and someone who declined notifications finds their ladder at day 1 with no explanation anywhere.',
  },
];

export const NotificationsPage = (): ReactElement => (
  <div className="flex max-w-[52rem] flex-col gap-8 bg-background-default p-8">
    <header className="flex flex-col gap-1">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title2}
        color={TypographyColor.Primary}
        bold
      >
        What the run is allowed to send
      </Typography>
      <Body>
        Two notifications, and no more. Four other things can already ping a
        brand-new account — daily quests, intro quests, the reading streak, the
        top reader badge — and this run buys its channel with a streak freeze. A
        bought channel is the last one to abuse.
      </Body>
    </header>

    {NOTIFICATIONS.map(({ name, title, body, trigger, why }) => (
      <Panel key={name}>
        <Heading>{name}</Heading>
        <div className="mt-4 flex flex-col gap-4 tablet:flex-row tablet:items-start">
          <PushCard title={title} body={body} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              <strong className="text-text-primary">Fires when:</strong>{' '}
              {trigger}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              <strong className="text-text-primary">Exists because:</strong>{' '}
              {why}
            </Typography>
          </div>
        </div>
      </Panel>
    ))}

    <Panel>
      <Heading>Why these two cannot collide</Heading>
      <Body>
        The first needs a post read that day; the second needs none. They are
        mutually exclusive by construction, so the one-a-day budget holds
        without a scheduler arbitrating between them. Both name the act rather
        than the app — read a post, then claim.
      </Body>
    </Panel>

    <Panel className="border-accent-cheese-default/40">
      <Heading>Considered and dropped</Heading>
      <Body>
        A daily nudge before the day ends, a separate “rewards have stacked”
        note, a “freeze spent” note, and a week-complete note. If one of these
        comes back, one of the two above has to go.
      </Body>
      <Body>
        Dropping the third has a consequence worth stating plainly: a spent
        freeze is now silent everywhere. Nothing on the card says it, and
        nothing is sent. The day {FINAL_DAY} finale is celebrated on the card
        itself, which is why it needs no notification of its own.
      </Body>
    </Panel>
  </div>
);
