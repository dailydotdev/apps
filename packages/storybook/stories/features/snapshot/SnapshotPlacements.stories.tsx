import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnapshotButton } from '@dailydotdev/shared/src/components/imageShare/SnapshotButton';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
// Via the barrel on purpose: the direct hook path is aliased to a mock that
// swallows toasts into console.log, so the real one never runs.
import {
  ToastType,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LeaderboardListItem } from '@dailydotdev/shared/src/components/cards/Leaderboard/LeaderboardListItem';
import { AchievementCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementCard';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { AchievementType } from '@dailydotdev/shared/src/graphql/user/achievements';
import {
  EditIcon,
  ArrowIcon,
  HotIcon,
  MedalBadgeIcon,
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
  LinkIcon,
  ShareIcon,
  CopyIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

const AVATAR =
  'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile';

const CaptureContext = React.createContext<(blob: Blob) => void>(() => {});

const useCaptureSink = () => React.useContext(CaptureContext);

const Snapshot = (
  props: Omit<React.ComponentProps<typeof SnapshotButton>, 'onCapture'>,
) => <SnapshotButton {...props} onCapture={useCaptureSink()} />;

type LeadAction = 'Link' | 'Share to' | 'Snapshot';

/** Only the action that should lead the surface — see the Sharing map. */
const PreferredActions = ({
  leads,
  target,
  filename,
  className,
}: {
  leads: LeadAction;
  target: React.RefObject<HTMLElement>;
  filename: string;
  className?: string;
}) => {
  if (leads === 'Snapshot') {
    return (
      <Snapshot
        className={className}
        filename={filename}
        target={target}
        variant={ButtonVariant.Secondary}
      />
    );
  }

  return (
    <Button
      className={className}
      icon={leads === 'Link' ? <LinkIcon /> : <ShareIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Secondary}
    >
      {leads === 'Link' ? 'Copy link' : 'Share'}
    </Button>
  );
};

/** Snapshot leads only where the payload is the value — see the Sharing map. */
const LEAD_STYLE: Record<LeadAction, string> = {
  Link: 'text-text-tertiary border-border-subtlest-tertiary',
  'Share to': 'text-text-tertiary border-border-subtlest-tertiary',
  Snapshot: 'text-accent-cabbage-default border-accent-cabbage-default',
};

/**
 * Most remaining surfaces are one of two shapes: a section header with a
 * control on the right, or a card with a control in its footer. Two mocks
 * cover them rather than thirteen bespoke ones.
 */
const HeaderSurface = ({
  eyebrow,
  title,
  meta,
  leads,
  filename,
  trailing,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
  leads: LeadAction;
  filename: string;
  trailing?: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="flex items-center gap-4 rounded-12 bg-background-default p-4"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {eyebrow && (
          <span className="font-bold uppercase text-text-quaternary typo-caption1">
            {eyebrow}
          </span>
        )}
        <span className="truncate font-bold text-text-primary typo-title3">
          {title}
        </span>
        {meta && (
          <span className="truncate text-text-tertiary typo-footnote">
            {meta}
          </span>
        )}
      </div>
      {trailing}
      <PreferredActions filename={filename} leads={leads} target={ref} />
    </div>
  );
};

const CardSurface = ({
  title,
  body,
  footer,
  leads,
  filename,
}: {
  title: string;
  body?: string;
  footer?: React.ReactNode;
  leads: LeadAction;
  filename: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-3 rounded-12 bg-background-default p-4">
      <div ref={ref} className="flex flex-col gap-2">
        <span className="font-bold text-text-primary typo-title3">{title}</span>
        {body && (
          <p className="text-text-secondary typo-callout">{body}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {footer}
        <PreferredActions filename={filename} leads={leads} target={ref} />
      </div>
    </div>
  );
};

/**
 * The floating bar from #6352: copy link, copy text, quote, share. Rebuilt
 * here because that PR is closed and SelectionShareBar never reached main —
 * same control set and chrome, with Snapshot added as the action that leads.
 */
const SelectionShareBarDemo = () => {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <div className="relative flex flex-col gap-2 rounded-12 bg-background-default p-4 pt-16">
      <div
        className="absolute left-6 top-4 flex items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2"
        role="toolbar"
        aria-label="Share selected text"
      >
        <Button
          aria-label="Copy link to this post"
          icon={<LinkIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        <Button
          aria-label="Copy selected text"
          icon={<CopyIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        <Button
          aria-label="Quote in a comment"
          icon={<DiscussIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        <Button
          aria-label="Share"
          icon={<ShareIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        <Snapshot
          filename="daily-quote"
          showLabel={false}
          target={ref}
          variant={ButtonVariant.Secondary}
        />
      </div>

      <span className="font-bold text-text-primary typo-title3">
        Why iconic tech brands like HTC and LG lost their dominance
      </span>
      <p className="text-text-secondary typo-callout">
        A brief retrospective on how once-dominant brands declined.{' '}
        <span
          ref={ref}
          className="rounded-4 bg-overlay-quaternary-cabbage text-text-primary"
        >
          TypeScript has become the default across frontend frameworks
        </span>{' '}
        and the rest of the stack followed within two release cycles.
      </p>
    </div>
  );
};

/** One control with the surfaces it appears on, so the set stays auditable. */
const Specimen = ({
  control,
  name,
  used,
}: {
  control: React.ReactNode;
  name: string;
  used: string;
}) => (
  <div className="flex w-64 flex-col gap-2">
    <div className="flex h-12 items-center">{control}</div>
    <span className="font-bold text-text-primary typo-footnote">{name}</span>
    <span className="text-text-tertiary typo-caption1">{used}</span>
  </div>
);

/**
 * Toasts render into a portal the app mounts once, so a story has to mount it
 * too or the feedback is invisible while testing.
 */
const ToastPreview = () => {
  const { displayToast } = useToastNotification();

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-bold text-text-primary typo-title3">Feedback</h3>
      <p className="max-w-[46rem] text-text-tertiary typo-callout">
        A download is silent on most browsers, so a capture confirms itself.
        Press a Snapshot button anywhere on this page to see the real one, or
        trigger them here.
      </p>
      <div className="flex flex-wrap items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
        <Button
          onClick={() =>
            displayToast('Snapshot saved', { variant: ToastType.Success })
          }
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          Success
        </Button>
        <Button
          onClick={() =>
            displayToast('Could not create the snapshot, please try again', {
              variant: ToastType.Error,
            })
          }
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          Error
        </Button>
        <Button
          onClick={() =>
            displayToast('Link copied', { variant: ToastType.Success })
          }
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          Copy link
        </Button>
      </div>
    </section>
  );
};

const Panel = ({
  step,
  title,
  note,
  leads,
  children,
}: {
  step: string;
  title: string;
  note: string;
  leads: LeadAction;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <header className="flex flex-col gap-0.5">
      <span className="font-bold text-text-quaternary typo-caption1">
        {step}
      </span>
      <div className="flex items-center gap-3">
        <h3 className="font-bold text-text-primary typo-title3">{title}</h3>
        <span
          className={`rounded-8 border px-2 py-0.5 typo-caption1 ${LEAD_STYLE[leads]}`}
        >
          leads with {leads}
        </span>
      </div>
      <p className="text-text-tertiary typo-callout">{note}</p>
    </header>
    <div className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
      {children}
    </div>
  </section>
);

/** 1. Post page — the button sits under the TLDR paragraph. */
const PostTldrPlacement = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div ref={ref} className="flex min-w-0 flex-col gap-4">
        <div className="flex items-center gap-2">
          <img src={AVATAR} alt="" className="size-8 rounded-10" />
          <span className="font-bold text-text-primary typo-footnote">
            XDA Developers
          </span>
        </div>
        <h1 className="break-words font-bold text-text-primary typo-title1">
          Why iconic tech brands like HTC and LG lost their dominance
        </h1>
        <p className="text-text-tertiary typo-callout">
          Yesterday · 1m read time · From xda-developers.com
        </p>
        <p className="select-text break-words text-text-secondary typo-markdown">
          A brief retrospective on how once-dominant tech and smartphone brands
          declined, citing OnePlus&apos;s recent troubles, LG&apos;s exit from
          the mobile business, and HTC&apos;s fall from once outselling Apple in
          America to a niche VR-focused company.
        </p>
      </div>
      <PreferredActions
        className="self-start"
        filename="daily-post"
        leads="Link"
        target={ref}
      />
    </div>
  );
};

/** 2. Happening now — next to "Read more" on an expanded highlight. */
const HighlightPlacement = () => {
  const ref = useRef<HTMLElement>(null);

  return (
    <article ref={ref} className="rounded-12 bg-background-default">
      <div className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-bold text-text-primary typo-body">
            Alibaba open-sources Qwen3.8-Max weights and releases 27B model for
            local use
          </span>
          <span className="mt-0.5 text-text-quaternary typo-footnote">
            14h ago
          </span>
        </div>
        <ArrowIcon size={IconSize.Small} className="shrink-0 rotate-180" />
      </div>
      <div className="flex flex-col gap-3 px-4 pb-3">
        <p className="text-text-secondary typo-markdown">
          Alibaba released downloadable weights for Qwen3.8-Max, a 2.4
          trillion-parameter mixture-of-experts vision-language model, alongside
          the smaller Qwen3.8-27B, within a week of unveiling the Max model.
        </p>
        <div className="flex items-center gap-4">
          <a className="font-bold text-text-link typo-footnote">Read more</a>
          <PreferredActions
            filename="daily-highlight"
            leads="Snapshot"
            target={ref}
          />
        </div>
      </div>
    </article>
  );
};

/** 3. Leaderboard — icon-only, revealed on row hover. */
const LEADERBOARD_ROWS = [
  { score: 15500, name: 'Bobby Iliev', handle: 'bobbyiliev', level: 103 },
  { score: 14200, name: 'Keshav Ashiya', handle: 'keshavashiya', level: 98 },
  { score: 13700, name: 'Hadil Ben Abdallah', handle: 'hadilben', level: 96 },
];

const LeaderboardPlacement = () => (
  <ul className="flex flex-col">
    {LEADERBOARD_ROWS.map((row) => (
      <LeaderboardListItem
        key={row.handle}
        index={row.score}
        snapshotFilename={`daily-leaderboard-${row.handle}`}
        className="group flex w-full flex-row items-center rounded-8 px-2 py-1.5 hover:bg-accent-pepper-subtler"
      >
        <span className="mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border-subtlest-tertiary text-text-primary typo-caption1">
          {row.level}
        </span>
        <img src={AVATAR} alt="" className="size-8 shrink-0 rounded-10" />
        <span className="ml-2 flex min-w-0 flex-col">
          <span className="truncate font-bold text-text-primary typo-caption1">
            {row.name}
          </span>
          <span className="truncate text-text-tertiary typo-caption2">
            @{row.handle}
          </span>
        </span>
      </LeaderboardListItem>
    ))}
  </ul>
);

/** 4. Watercooler feed — one per post card, in the card action row. */
const WatercoolerPlacement = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      <div ref={ref} className="flex flex-col">
        <div className="flex items-center gap-2">
          <img src={AVATAR} alt="" className="size-8 rounded-10" />
          <div className="flex flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              Ante Barić
            </span>
            <span className="text-text-quaternary typo-caption1">
              Watercooler · 2h
            </span>
          </div>
        </div>
        <h4 className="mt-2 font-bold text-text-primary typo-title3">
          What is the one dev tool you would not give up?
        </h4>
        <p className="mt-1 text-text-secondary typo-callout">
          Mine is ripgrep. I use it more than my editor at this point.
        </p>
      </div>
      <div className="mt-3 flex items-center gap-4 text-text-tertiary">
        <UpvoteIcon />
        <DiscussIcon />
        <BookmarkIcon />
        <PreferredActions
          filename="daily-watercooler"
          leads="Link"
          target={ref}
        />
      </div>
    </div>
  );
};

/** 5. Hot takes modal — icon-only, top-right of the swipe card. */
const HotTakePlacement = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative flex h-72 select-none flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle"
    >
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6">
        <div className="flex size-16 items-center justify-center rounded-16 bg-overlay-quaternary-cabbage text-[2.5rem]">
          🔥
        </div>
        <p className="w-full break-words text-center font-bold text-text-primary typo-title3">
          Tabs won. Prettier just hid the bodies.
        </p>
        <p className="w-full break-words text-center text-text-tertiary typo-body">
          Every formatter argument is a proxy war over indentation.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-10 bg-surface-hover px-3 py-1">
            <HotIcon className="text-accent-cabbage-default" />
            <span className="font-bold text-text-secondary typo-footnote">
              128
            </span>
          </div>
          <PreferredActions
            filename="daily-hot-take"
            leads="Snapshot"
            target={ref}
          />
        </div>
      </div>
    </div>
  );
};

/** 6a. Profile header — right of the edit button. */
const ProfileHeaderPlacement = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-16 bg-background-default"
    >
      <div className="h-24 bg-overlay-quaternary-cabbage" />
      <img
        src={AVATAR}
        alt=""
        className="absolute left-6 top-12 size-24 rounded-16 object-cover"
      />
      <div className="flex flex-col gap-3 px-6">
        <div className="mb-4 ml-auto mt-2 flex items-center gap-2">
          <Button
            variant={ButtonVariant.Float}
            icon={<EditIcon />}
            aria-label="Edit profile"
            className="text-text-secondary"
          />
          <PreferredActions
            filename="daily-profile"
            leads="Link"
            target={ref}
          />
        </div>
        <span className="font-bold text-text-primary typo-title2">
          Tomer Redlich
        </span>
        <span className="pb-4 text-text-tertiary typo-callout">@tomer</span>
      </div>
    </div>
  );
};

/** 6b–6d. Profile widgets — icon-only, in the widget header row. */
const WidgetPlacement = ({
  title,
  trailing,
  children,
}: {
  title: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      ref={ref}
      className="flex w-full flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1 font-bold text-text-primary typo-callout">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          {trailing}
          <PreferredActions
            filename="daily-widget"
            leads="Snapshot"
            target={ref}
          />
        </div>
      </div>
      {children}
    </section>
  );
};

const ACHIEVEMENT: UserAchievement = {
  achievement: {
    id: 'achievement-1',
    name: 'Streak keeper',
    description: 'Read something on daily.dev 100 days in a row.',
    image:
      'https://media.daily.dev/image/upload/s--SNnLKKWe--/q_auto/v1773608419/achievements/coraholic',
    points: 120,
    rarity: 4,
    type: AchievementType.Milestone,
    criteria: { targetCount: 100 },
    unit: 'days',
  },
  progress: 100,
  unlockedAt: '2026-06-01T00:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
};

const LOCKED_ACHIEVEMENT: UserAchievement = {
  ...ACHIEVEMENT,
  achievement: {
    ...ACHIEVEMENT.achievement,
    id: 'achievement-2',
    name: 'First take',
    description: 'Post your first hot take.',
    rarity: 38,
    image:
      'https://media.daily.dev/image/upload/v1770222937/achievements/Town_crier.png',
    criteria: { targetCount: 1 },
    unit: null,
  },
  progress: 0,
  unlockedAt: null,
};

const Placements = () => {
  const [capture, setCapture] = useState<string | null>(null);
  const onCapture = React.useCallback((blob: Blob) => {
    setCapture(URL.createObjectURL(blob));
  }, []);

  return (
    <CaptureContext.Provider value={onCapture}>
      <div className="flex flex-col gap-10 p-6">
        <header className="flex flex-col gap-3">
          <h1 className="font-bold text-text-primary typo-mega3">
            Snapshot button placements
          </h1>
          <p className="max-w-[46rem] text-text-tertiary typo-body">
            Every surface that gets a Snapshot control, and which of the three
            share actions leads there. Pressing any button captures its
            surrounding block into the square share image, shown in the panel
            below.
          </p>
          <p className="max-w-[46rem] text-text-tertiary typo-callout">
            <b className="text-text-primary">Snapshot leads</b> where the
            payload is the value and there is often no page to visit: a quote, a
            rank, a take, an unlocked achievement.{' '}
            <b className="text-text-primary">Link leads</b> where the
            destination adds something the image cannot — the article, the
            profile you can follow, the squad you can join. Snapshot still
            appears on those surfaces, just not first. Full reasoning in{' '}
            <b className="text-text-primary">Sharing map</b>.
          </p>
          <p className="max-w-[46rem] text-text-quaternary typo-footnote">
            Placements 1–7 are built and live; 8–20 are mock-ups of surfaces the
            Sharing map covers but the code does not touch yet, so the control
            and its verdict can be reviewed before anything is wired.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h3 className="font-bold text-text-primary typo-title3">
            Last capture
          </h3>
          {capture ? (
            <img
              src={capture}
              alt="Captured share image"
              className="w-full max-w-[42rem] rounded-12 border border-border-subtlest-tertiary"
            />
          ) : (
            <p className="text-text-quaternary typo-callout">
              Press a Snapshot button to render the share image here.
            </p>
          )}
        </section>

        <ToastPreview />

        <section className="flex flex-col gap-3">
          <h3 className="font-bold text-text-primary typo-title3">
            The control
          </h3>
          <div className="flex flex-wrap gap-8 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-6">
            <Specimen
              control={
                <Snapshot
                  filename="daily-snapshot"
                  target={{ current: null }}
                  variant={ButtonVariant.Secondary}
                />
              }
              name="Snapshot — labelled"
              used="Leads on Happening now, hot takes, briefing, streak, copy my feed and the profile widgets"
            />
            <Specimen
              control={
                <Snapshot
                  filename="daily-snapshot"
                  showLabel={false}
                  size={ButtonSize.XSmall}
                  target={{ current: null }}
                  variant={ButtonVariant.Float}
                />
              }
              name="Snapshot — icon, hover revealed"
              used="Leaderboard rows and achievement cards, where a labelled button would crowd the list"
            />
            <Specimen
              control={
                <Snapshot
                  filename="daily-snapshot"
                  showLabel={false}
                  target={{ current: null }}
                  variant={ButtonVariant.Secondary}
                />
              }
              name="Snapshot — icon, emphasised"
              used="The floating selection bar, where every control is an icon and this one leads"
            />
            <Specimen
              control={
                <Button
                  icon={<LinkIcon />}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                >
                  Copy link
                </Button>
              }
              name="Copy link — labelled"
              used="Leads on the post, watercooler, profile header, tags and sources, leaderboard page, history, squads, best-of and invite"
            />
            <Specimen
              control={
                <Button
                  icon={<ShareIcon />}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                >
                  Share
                </Button>
              }
              name="Share — labelled"
              used="Leads on the DevCard, which is already an image"
            />
            <Specimen
              control={
                <div className="flex items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1">
                  <Button
                    aria-label="Copy link"
                    icon={<LinkIcon />}
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                  />
                  <Button
                    aria-label="Copy text"
                    icon={<CopyIcon />}
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                  />
                  <Button
                    aria-label="Quote"
                    icon={<DiscussIcon />}
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                  />
                  <Button
                    aria-label="Share"
                    icon={<ShareIcon />}
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                  />
                </div>
              }
              name="Secondary set — icons only"
              used="The floating selection bar from #6352: copy link, copy text, quote, share"
            />
          </div>
        </section>

        <Panel
          step="Placement 1"
          leads="Link"
          title="Post page — under the TLDR"
          note="Copy link leads: posts already have a real per-post OG image, so an unfurled link carries the article better than a picture of it."
        >
          <PostTldrPlacement />
        </Panel>

        <Panel
          step="Placement 2"
          leads="Snapshot"
          title="Happening now — expanded highlight"
          note="Snapshot leads: the headline and TLDR are the whole payload, and news travels through chat apps where an image gets read in the scroll."
        >
          <HighlightPlacement />
        </Panel>

        <Panel
          step="Placement 3"
          leads="Snapshot"
          title="Leaderboards — on row hover"
          note="Snapshot leads: a rank is status, and a link shows the reader this week's board, not your moment. Icon-only on hover so the table stays quiet."
        >
          <LeaderboardPlacement />
        </Panel>

        <Panel
          step="Placement 4"
          leads="Link"
          title="Watercooler feed — per post card"
          note="Copy link leads: it is a post with a destination. Snapshot sits beside the bookmark, watercooler feed only."
        >
          <WatercoolerPlacement />
        </Panel>

        <Panel
          step="Placement 5"
          leads="Snapshot"
          title="Hot takes — per take"
          note="Snapshot leads: a take is self-contained and quotable, and there is no per-take page to send anyone to."
        >
          <HotTakePlacement />
        </Panel>

        <Panel
          step="Placement 6"
          leads="Link"
          title="Profile — header and widgets"
          note="Copy link leads on the header — profiles have a real OG and the point is that they follow you. Snapshot leads in the widgets: reading overview, badges and achievements have no URL anyone else can open."
        >
          <div className="flex flex-col gap-4">
            <ProfileHeaderPlacement />
            <div className="grid gap-4 laptop:grid-cols-3">
              <WidgetPlacement
                title="Reading Overview"
                trailing={
                  <span className="text-text-link typo-footnote">
                    Learn more
                  </span>
                }
              >
                <p className="mt-3 text-text-tertiary typo-footnote">
                  Posts read in the last months (412)
                </p>
                <div className="mt-2 grid grid-cols-12 gap-1">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      className="size-3 rounded-4 bg-surface-float"
                    />
                  ))}
                </div>
              </WidgetPlacement>

              <WidgetPlacement title="Badges & Awards">
                <div className="my-3 flex gap-3">
                  <div className="flex flex-1 flex-col rounded-12 bg-surface-float p-3">
                    <span className="font-bold text-text-primary typo-title3">
                      x4
                    </span>
                    <span className="text-text-tertiary typo-caption1">
                      Top reader badge
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col rounded-12 bg-surface-float p-3">
                    <span className="font-bold text-text-primary typo-title3">
                      x12
                    </span>
                    <span className="text-text-tertiary typo-caption1">
                      Total Awards
                    </span>
                  </div>
                </div>
              </WidgetPlacement>

              <WidgetPlacement
                title={
                  <>
                    <MedalBadgeIcon className="size-4" />
                    Achievements
                  </>
                }
                trailing={
                  <span className="text-text-link typo-footnote">18/60</span>
                }
              >
                <div className="mt-3 flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      className="size-10 rounded-10 bg-surface-float"
                    />
                  ))}
                </div>
              </WidgetPlacement>
            </div>
          </div>
        </Panel>

        <Panel
          step="Placement 7"
          leads="Snapshot"
          title="Achievements page — per achievement box"
          note="Snapshot leads: an unlocked achievement is status with no shareable URL. Icon-only on hover, beside the points value."
        >
          <div className="grid gap-4 laptop:grid-cols-2">
            <AchievementCard userAchievement={ACHIEVEMENT} />
            <AchievementCard userAchievement={LOCKED_ACHIEVEMENT} />
          </div>
        </Panel>

        <Panel
          step="Placement 8"
          leads="Snapshot"
          title="Floating share bar — selected text in posts and comments"
          note="From #6352: copy link, copy text, quote, share. Snapshot joins them and leads — someone marking a sentence has already decided that sentence is worth passing on, and it captures the selection, not the page."
        >
          <SelectionShareBarDemo />
        </Panel>

        <Panel
          step="Placement 9"
          leads="Link"
          title="End of conversation"
          note="Copy link leads: the thread keeps moving, and a still frame of it goes stale the moment someone replies."
        >
          <CardSurface
            filename="daily-thread"
            leads="Link"
            title="Enjoyed this discussion?"
            body="24 replies · last one 4 minutes ago"
          />
        </Panel>

        <Panel
          step="Placement 10"
          leads="Link"
          title="After an upvote"
          note="Copy link leads: same payload as the post, so this reuses the post's own image rather than making a second one."
        >
          <CardSurface
            filename="daily-upvoted"
            leads="Link"
            title="Should anyone else see this?"
            body="You upvoted “Why iconic tech brands lost their dominance”"
          />
        </Panel>

        <Panel
          step="Placement 11"
          leads="Snapshot"
          title="Briefing and digest"
          note="Snapshot leads: a briefing is personalized, so a link gives the recipient their briefing or nothing at all."
        >
          <HeaderSurface
            eyebrow="Your briefing"
            filename="daily-briefing"
            leads="Snapshot"
            meta="Tuesday, 26 August · 5 posts"
            title="5 things worth your morning"
          />
        </Panel>

        <Panel
          step="Placement 12"
          leads="Link"
          title="Tag and source pages"
          note="Copy link leads: a live feed is worth landing on. These currently unfurl as the generic daily.dev tile — a real OG image would lift every share of the URL, not just the ones that press a button."
        >
          <div className="flex flex-col gap-3">
            <HeaderSurface
              filename="daily-tag"
              leads="Link"
              meta="48.2K followers · 1.2K posts"
              title="#typescript"
              trailing={
                <Button size={ButtonSize.Small} variant={ButtonVariant.Float}>
                  Follow
                </Button>
              }
            />
            <HeaderSurface
              filename="daily-source"
              leads="Link"
              meta="12.4K followers · 8.6K posts"
              title="XDA Developers"
              trailing={
                <Button size={ButtonSize.Small} variant={ButtonVariant.Float}>
                  Follow
                </Button>
              }
            />
          </div>
        </Panel>

        <Panel
          step="Placement 13"
          leads="Link"
          title="Leaderboard page"
          note="Copy link leads for the board itself — it changes weekly, so a link stays true where an image does not. Sharing your own rank is Placement 3."
        >
          <HeaderSurface
            eyebrow="Leaderboard"
            filename="daily-leaderboard"
            leads="Link"
            meta="Updated weekly"
            title="Highest level"
          />
        </Panel>

        <Panel
          step="Placement 14"
          leads="Snapshot"
          title="Reading streak popup"
          note="Snapshot leads: a link to your streak means nothing to anyone else. There is no page for the recipient to visit."
        >
          <CardSurface
            filename="daily-streak"
            leads="Snapshot"
            title="100 day reading streak"
            body="A new personal best — longest streak 100, 720 total reading days."
          />
        </Panel>

        <Panel
          step="Placement 15"
          leads="Share to"
          title="DevCard"
          note="Share to leads: the DevCard already is an image. Wrapping an image in another image adds nothing."
        >
          <CardSurface
            filename="daily-devcard"
            leads="Share to"
            title="Your DevCard is ready"
            body="Download it, or send it straight to a network."
            footer={
              <Button size={ButtonSize.Small} variant={ButtonVariant.Float}>
                Download
              </Button>
            }
          />
        </Panel>

        <Panel
          step="Placement 16"
          leads="Link"
          title="Reading history row"
          note="Copy link leads: each row is just a post, and the post's own OG image does the work."
        >
          <HeaderSurface
            filename="daily-history"
            leads="Link"
            meta="Read yesterday · xda-developers.com"
            title="Why iconic tech brands lost their dominance"
          />
        </Panel>

        <Panel
          step="Placement 17"
          leads="Snapshot"
          title="Copy my feed"
          note="Snapshot leads: your feed has no URL anyone else can open, so an image is the only thing that can carry it."
        >
          <HeaderSurface
            eyebrow="My feed"
            filename="daily-my-feed"
            leads="Snapshot"
            meta="Top 20 posts right now"
            title="What I'm reading"
          />
        </Panel>

        <Panel
          step="Placement 18"
          leads="Link"
          title="Squad directory card"
          note="Copy link leads: the point is that they join. Same generic-OG gap as tags and sources."
        >
          <HeaderSurface
            filename="daily-squad"
            leads="Link"
            meta="3.4K members · 820 posts"
            title="Frontend Fans"
            trailing={
              <Button size={ButtonSize.Small} variant={ButtonVariant.Float}>
                Join
              </Button>
            }
          />
        </Panel>

        <Panel
          step="Placement 19"
          leads="Link"
          title="Best of and discovery"
          note="Copy link leads: an evergreen page worth landing on, and the link keeps working as the collection grows."
        >
          <HeaderSurface
            eyebrow="Best of August"
            filename="daily-best-of"
            leads="Link"
            meta="The 5 posts developers upvoted most"
            title="August's most upvoted reads"
          />
        </Panel>

        <Panel
          step="Placement 20"
          leads="Link"
          title="Invite a friend"
          note="Copy link leads, and this one is not a preference: an image of a referral link cannot be clicked. Share only the picture and the referral silently fails."
        >
          <CardSurface
            filename="daily-invite"
            leads="Link"
            title="Come read with me on daily.dev"
            body="We both get a month of Plus · daily.dev/join/tomer"
          />
        </Panel>
      </div>
    </CaptureContext.Provider>
  );
};

const meta: Meta<typeof Placements> = {
  title: 'Features/Snapshot/Button placements',
  component: Placements,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
        {/* The app mounts this once; a story has to as well or the feedback
            never appears. */}
        <Toast autoDismissNotifications />
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const AllPlacements: StoryObj<typeof Placements> = {};
