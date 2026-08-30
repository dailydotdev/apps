import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnapshotButton } from '@dailydotdev/shared/src/components/imageShare/SnapshotButton';
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

const Panel = ({
  step,
  title,
  note,
  children,
}: {
  step: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <header className="flex flex-col gap-0.5">
      <span className="font-bold text-text-quaternary typo-caption1">
        {step}
      </span>
      <h3 className="font-bold text-text-primary typo-title3">{title}</h3>
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
      <Snapshot className="self-start" filename="daily-post" target={ref} />
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
          <Snapshot filename="daily-highlight" target={ref} />
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
        <Snapshot
          filename="daily-watercooler"
          showLabel={false}
          target={ref}
          variant={ButtonVariant.Tertiary}
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
          <Snapshot
            filename="daily-hot-take"
            showLabel={false}
            target={ref}
            variant={ButtonVariant.Float}
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
          <Snapshot
            filename="daily-profile"
            showLabel={false}
            size={ButtonSize.Medium}
            target={ref}
            variant={ButtonVariant.Float}
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
          <Snapshot filename="daily-widget" showLabel={false} target={ref} />
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
        <header className="flex flex-col gap-2">
          <h1 className="font-bold text-text-primary typo-mega3">
            Snapshot button placements
          </h1>
          <p className="max-w-[46rem] text-text-tertiary typo-body">
            Every surface that gets a Snapshot control. Pressing any of them
            captures the surrounding block and composes it onto the 1200×630
            share image — the result appears in the panel below.
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

        <section className="flex flex-col gap-3">
          <h3 className="font-bold text-text-primary typo-title3">
            The control
          </h3>
          <div className="flex flex-wrap items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
            <Snapshot filename="daily-snapshot" target={{ current: null }} />
            <Snapshot
              filename="daily-snapshot"
              target={{ current: null }}
              variant={ButtonVariant.Secondary}
            />
            <Snapshot
              filename="daily-snapshot"
              showLabel={false}
              target={{ current: null }}
              variant={ButtonVariant.Float}
            />
            <Snapshot
              filename="daily-snapshot"
              showLabel={false}
              size={ButtonSize.XSmall}
              target={{ current: null }}
              variant={ButtonVariant.Float}
            />
          </div>
        </section>

        <Panel
          step="Placement 1"
          title="Post page — under the TLDR"
          note="Labelled button, left-aligned below the summary. Captures the source, title, metadata and TLDR."
        >
          <PostTldrPlacement />
        </Panel>

        <Panel
          step="Placement 2"
          title="Happening now — expanded highlight"
          note="Sits in the footer row beside Read more. Captures the headline and its TLDR."
        >
          <HighlightPlacement />
        </Panel>

        <Panel
          step="Placement 3"
          title="Leaderboards — on row hover"
          note="Icon-only, revealed on hover or keyboard focus so the tables stay quiet. Hover a row."
        >
          <LeaderboardPlacement />
        </Panel>

        <Panel
          step="Placement 4"
          title="Watercooler feed — per post card"
          note="Labelled button in the card action row, only on the watercooler feed."
        >
          <WatercoolerPlacement />
        </Panel>

        <Panel
          step="Placement 5"
          title="Hot takes — per take"
          note="Icon-only, floated over the top-right of the active swipe card."
        >
          <HotTakePlacement />
        </Panel>

        <Panel
          step="Placement 6"
          title="Profile — header and widgets"
          note="Next to the edit action in the header, and in each widget header: reading overview, badges and worlds, achievements."
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
          title="Achievements page — per achievement box"
          note="Icon-only, revealed on card hover beside the points value. Uses the real AchievementCard."
        >
          <div className="grid gap-4 laptop:grid-cols-2">
            <AchievementCard userAchievement={ACHIEVEMENT} />
            <AchievementCard userAchievement={LOCKED_ACHIEVEMENT} />
          </div>
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
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const AllPlacements: StoryObj<typeof Placements> = {};
