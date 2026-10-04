import type { ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FeedBackdrop } from '../../milestone-rewards/shell';
import { Phase, WeeklyRewardsModal } from './WeeklyRewardsModal';
import { StreakPanel } from './streakPopover';

// The zero-day reading run, start to finish, on one page: where it opens from,
// then every state of the card.
//
// The card is `WeeklyRewardsModal` — the reviewed design, and the only one.
// Everything here renders that component, so this page cannot drift from it.
//
// This is a READING streak. Opening the app is not the qualifying act — a post
// has to be read before anything is claimable, which is why `Phase.Unread` is
// a state of its own and why no copy here says "come back".
//
// RESPONSIVE: the card's arrangement is driven by the VIEWPORT, not by the box
// it is dropped into — a bottom sheet with a scrolling day row under 656px, a
// fluid card with the seven days across from there, and the cast only from
// 1120px where there is room beside it. Side-by-side widths on one page cannot
// show that, so resize the preview (or the Viewport toolbar) to judge it, and
// see `ZeroDayStreak Review` for the card on its own at full bleed.

// The production claim animation portals through `RootPortal`, which reaches for
// a QueryClient via `useRequestProtocol`. Without one it throws and takes the
// whole story down with it, so the page supplies a throwaway client.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <header className="flex flex-wrap items-baseline gap-x-3">
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    </header>
    {children}
  </section>
);

/**
 * The dark feed behind every surface here, so nothing is judged on white.
 *
 * Almost no horizontal padding on a phone: the card is a bottom sheet at that
 * width and expects the whole screen. Padding it in would squeeze it below the
 * width its own breakpoints assume, and the close button starts colliding with
 * the balance — a fault of the stage, not of the card.
 */
const Backdrop = ({ children }: { children: ReactNode }) => (
  <div className="relative flex items-start justify-center overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default px-1 py-6 tablet:px-10 tablet:py-14">
    <FeedBackdrop />
    <div className="absolute inset-0 bg-overlay-primary-pepper" />
    {children}
  </div>
);

/**
 * Every state of the run.
 *
 * `streakDays` is the reader's whole reading streak, not the day of the run.
 * It matches the run day here because these are brand-new accounts — the two
 * only diverge for someone who arrives with a streak already going.
 */
const STATE_SHEET: Array<{
  title: string;
  note: string;
  day: number;
  phase: Phase;
  streakDays: number;
  pendingDays?: number[];
}> = [
  {
    title: '1 · First view',
    note: 'The only place the loop is explained, and the only place the price of entry is stated.',
    day: 1,
    phase: Phase.Ready,
    streakDays: 1,
  },
  {
    title: '2 · Back, nothing read yet',
    note: "The most common return state. Today's slot is a dashed outline, because nothing is earned until a post is read.",
    day: 4,
    phase: Phase.Unread,
    streakDays: 3,
  },
  {
    title: '3 · Read, ready to claim',
    note: 'The only state with a live claim. Press it — the Cores fly to the balance.',
    day: 3,
    phase: Phase.Ready,
    streakDays: 3,
  },
  {
    title: '4 · Two days to claim',
    note: 'Yesterday was read and never collected. Reading earns a day, claiming collects it, and the two need not happen together.',
    day: 5,
    phase: Phase.Ready,
    streakDays: 5,
    pendingDays: [4],
  },
  {
    title: '5 · Claimed today',
    note: "Today's tile keeps its lit frame and takes the flame and tick; the slot becomes its day label.",
    day: 3,
    phase: Phase.Claimed,
    streakDays: 3,
  },
  {
    title: '6 · One off the end',
    note: 'Six behind, one to go. The finale is the only tile left unclaimed.',
    day: 6,
    phase: Phase.Ready,
    streakDays: 6,
  },
  {
    title: '7 · The finale',
    note: 'The last claim of the week, and the only state with no reminder offer under it.',
    day: 7,
    phase: Phase.Ready,
    streakDays: 7,
  },
  {
    title: '8 · Run complete',
    note: 'Confetti once, and the one moment the header changes — there is no rule left to state over a finished week.',
    day: 7,
    phase: Phase.Claimed,
    streakDays: 7,
  },
];

/**
 * One breakpoint, in a frame of its own.
 *
 * The card's arrangement follows the VIEWPORT, so a div of a given width will
 * not trigger it — only a real viewport will. An iframe has one, which is what
 * lets all three sit on this page instead of being three stories you have to
 * resize the preview to see.
 */
const Breakpoint = ({
  label,
  note,
  width,
  height,
}: {
  label: string;
  note: string;
  width: number;
  height: number;
}) => (
  <figure className="flex flex-col gap-2">
    <figcaption className="flex flex-col">
      <Typography type={TypographyType.Footnote} bold>
        {label}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    </figcaption>
    <iframe
      title={label}
      src={`iframe.html?id=features-zerodaystreak--card&viewMode=story&globals=theme:dark`}
      width={width}
      height={height}
      className="shrink-0 rounded-16 border border-border-subtlest-tertiary bg-background-default"
    />
  </figure>
);

const Page = () => (
  <QueryClientProvider client={queryClient}>
    <div className="flex flex-col gap-10 bg-background-default px-2 py-6 tablet:p-8">
      <header className="flex max-w-[48rem] flex-col items-start gap-1">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
        >
          Zero-day streak
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Seven days, one claim a day, gated on reading a post. Everything that
          ships: the entry point in the reading-streak panel, and every state of
          the card. Resize the preview to see the card&apos;s own responsive
          arrangement — its breakpoints follow the viewport, not this page.
        </Typography>
      </header>

      <Section
        title="Entry · The reading streak panel"
        note="A row built like the freeze row below it, above it because it is the one with something waiting."
      >
        <Backdrop>
          <div className="relative">
            <StreakPanel />
          </div>
        </Backdrop>
      </Section>

      <Section
        title="Responsive · one card, three arrangements"
        note="Real frames, not boxes — the card's breakpoints follow the viewport, so each of these has one of its own."
      >
        <div className="flex flex-wrap items-start gap-6 overflow-x-auto">
          <Breakpoint
            label="Phone · 375"
            note="A bottom sheet. The day row scrolls and parks on today; closing is a full-width button, not the X."
            width={375}
            height={760}
          />
          <Breakpoint
            label="Tablet · 768"
            note="The seven days go across. The X returns, and the footer is one row."
            width={768}
            height={480}
          />
          <Breakpoint
            label="Desktop · 1280"
            note="The same card with room around it. The cast only appears from 1120."
            width={1280}
            height={560}
          />
        </div>
      </Section>

      {STATE_SHEET.map(
        ({ title, note, day, phase, streakDays, pendingDays }) => (
          <Section key={title} title={title} note={note}>
            <Backdrop>
              <div className="relative flex w-full justify-center">
                <WeeklyRewardsModal
                  day={day}
                  phase={phase}
                  streakDays={streakDays}
                  pendingDays={pendingDays}
                  onClaim={() => undefined}
                />
              </div>
            </Backdrop>
          </Section>
        ),
      )}
    </div>
  </QueryClientProvider>
);

const meta: Meta = {
  title: 'Features/ZeroDayStreak',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

/** Every surface of the run, on one page. */
export const Design: Story = {
  render: () => <Page />,
};

/**
 * The card on its own, which the breakpoint frames above load.
 *
 * It exists to be framed: each iframe gives it a real viewport, which is the
 * only way its own breakpoints fire.
 */
export const Card: Story = {
  render: () => (
    <QueryClientProvider client={queryClient}>
      <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background-default">
        <FeedBackdrop />
        <div className="absolute inset-0 bg-overlay-primary-pepper" />
        <div className="relative flex w-full justify-center">
          <WeeklyRewardsModal
            day={3}
            phase={Phase.Ready}
            streakDays={3}
            onClaim={() => undefined}
            onClose={() => undefined}
          />
        </div>
      </div>
    </QueryClientProvider>
  ),
};
