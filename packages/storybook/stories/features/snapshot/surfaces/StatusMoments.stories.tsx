import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { DownloadIcon } from '@dailydotdev/shared/src/components/icons/Download';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { TopRankBadge } from '@dailydotdev/shared/src/components/cards/Leaderboard/TopRankBadge';
import {
  ART,
  AVATAR,
  Category,
  Control,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';
import type { StreakMilestone } from '../../../milestone-rewards/data';
import { StreakTier, streakLadder } from '../../../milestone-rewards/data';
import {
  DayStrip,
  EmberPanel,
  FlameBadge,
  FlameSize,
  NoThanks,
  TierName,
} from '../../../milestone-rewards/moment';

/* --------------------------------------------------- streak celebration */

const INFERNO = streakLadder.find(
  ({ tier }) => tier === StreakTier.Inferno,
) as StreakMilestone;

/**
 * The celebration half of the milestone-rewards popup: tier art over the
 * ember wash, the tier name, the count. No embers or staged entrance, since
 * this page compares control placement.
 */
const Celebration = () => (
  <EmberPanel className="flex-col items-center gap-4 p-6 text-center">
    <FlameBadge
      milestone={INFERNO}
      size={FlameSize.Medium}
      withEmbers={false}
    />
    <TierName milestone={INFERNO} />
    <div className="flex flex-col gap-1">
      <span className="flex items-baseline justify-center gap-2 text-text-primary">
        <strong className="font-bold tabular-nums typo-mega2">
          {INFERNO.day}
        </strong>
        <span className="font-normal typo-title3">day streak</span>
      </span>
      <h2 className="text-text-primary typo-title3">{INFERNO.headline}</h2>
    </div>
    <DayStrip />
  </EmberPanel>
);

/* -------------------------------------------------------------- surfaces */

/**
 * The streak milestone popup from Milestone Rewards/Final review, at phone
 * width: celebration panel above, the controls below.
 */
const StreakScreen = () => (
  <Screen>
    <div className="relative flex flex-col">
      <CloseButton
        className="absolute right-4 top-4 z-2"
        size={ButtonSize.Small}
      />

      <Celebration />

      <div className="flex flex-col gap-4 p-6">
        <Control
          action="Snapshot"
          label
          size={ButtonSize.Medium}
          variant={ButtonVariant.Float}
        />

        <NoThanks />
      </div>
    </div>
  </Screen>
);

/** AchievementCard.tsx, the unlock card, with the real achievement. */
const AchievementScreen = () => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div className="flex items-start gap-3">
          <img
            alt=""
            className="size-12 shrink-0 rounded-12 object-cover"
            src={ART}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              Can&apos;t spend it all
            </span>
            <span className="mt-0.5 line-clamp-2 text-text-tertiary typo-footnote">
              Spend 10000 Cores
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 self-center">
            <Control
              action="Snapshot"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Float}
            />
            <span className="font-bold text-text-primary typo-callout">25</span>
          </div>
        </div>
      </div>
    </div>
  </Screen>
);

/** Fictional readers for the rank and awards screens. */
const PEOPLE: [string, string][] = [
  ['Maya Torres', 'mayatorres'],
  ['Jonah Pike', 'jonahpike'],
  ['Lena Brandt', 'lenabrandt'],
];

/** UserTopList.tsx, the leaderboard rows. */
const RankScreen = () => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      <h3 className="mb-2 font-bold text-text-primary typo-title3">
        Highest level
      </h3>

      <ol className="flex flex-col gap-1.5 typo-body">
        {PEOPLE.map(([name, handle], index) => (
          <li
            key={handle}
            className={`group flex w-full flex-row items-center rounded-8 px-2 ${
              index === 0 ? 'bg-accent-pepper-subtler' : ''
            }`}
          >
            <TopRankBadge rankIndex={index} />
            <div className="flex min-w-0 shrink items-center gap-2 p-2">
              <ProfilePicture
                rounded="full"
                size={ProfileImageSize.Medium}
                user={{ image: AVATAR, username: handle }}
              />
              <div className="ml-2 flex min-w-0 flex-col">
                <span className="truncate text-text-primary typo-caption1">
                  {name}
                </span>
                <span className="truncate text-text-tertiary typo-caption2">
                  @{handle}
                </span>
              </div>
            </div>
            {index === 0 && (
              <Control
                action="Snapshot"
                className="ml-auto"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Float}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  </Screen>
);

/* -------------------------------------------------- other win moments */

/** TopReaderBadgeModal.tsx, download only, no share route. */
const TopReaderScreen = () => (
  <Screen>
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <div className="flex size-32 items-center justify-center rounded-16 bg-gradient-to-br from-accent-bacon-default to-accent-cabbage-default">
        <span className="text-[2.5rem]">🥇</span>
      </div>
      <h1 className="font-bold text-text-primary typo-title1">
        You&apos;ve earned the top reader badge!
      </h1>
      <div className="mt-2 flex items-center gap-2">
        <Button
          icon={<DownloadIcon secondary />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
        >
          Download badge
        </Button>
        <Control action="Snapshot" label variant={ButtonVariant.Primary} />
      </div>
    </div>
  </Screen>
);

/** The tier moment on its own: the celebration panel with no decision under it. */
const StreakTierScreen = () => (
  <Screen>
    <Celebration />
    <div className="p-6 pt-0">
      <Control action="Snapshot" label variant={ButtonVariant.Primary} />
    </div>
  </Screen>
);

/** ListAwardsModal.tsx, from the recipient's side. */
const AwardedScreen = () => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-text-primary typo-title3">
          Awards given
        </span>
        <div className="flex items-center gap-1">
          <Control action="Snapshot" />
          <CloseButton size={ButtonSize.Small} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary py-4">
        <span className="flex size-14 items-center justify-center rounded-full bg-overlay-quaternary-bun text-[1.75rem]">
          🪙
        </span>
        <div className="flex flex-col">
          <span className="text-text-tertiary typo-body">Cores given</span>
          <span className="font-bold text-text-primary typo-title2">1,250</span>
        </div>
        <Control
          action="Snapshot"
          className="ml-auto"
          label
          variant={ButtonVariant.Primary}
        />
      </div>

      {PEOPLE.map(([name, handle]) => (
        <div key={handle} className="flex items-center gap-3">
          <ProfilePicture
            rounded="full"
            size={ProfileImageSize.Medium}
            user={{ image: AVATAR, username: handle }}
          />
          <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
            {name}
          </span>
          <span className="text-xl">🏅</span>
        </div>
      ))}
    </div>
  </Screen>
);

const StatusMoments = () => (
  <SurfacePage
    intro="Six surfaces that share one property: there is no page to send anyone to. A link to your streak, your rank or your unlocked achievement means nothing to the person receiving it. Snapshot is not the louder option here. It is the only one."
    map="Sharing map: lead with Snapshot on all three (#6358 streak, #6360 achievements, #6359 rank). Copy link is not a secondary option, it is absent, because there is nothing to link to."
    title="Status moments"
  >
    <Category
      covers="#6358 · streak popup"
      title="Reading streak"
      verdict="Placement is settled; frequency is the real lever. Every day dulls it, while 10 / 50 / 100 keeps it an event."
    >
      <Variant
        headline="Snapshot under the celebration"
        note="Recommended. The number is the entire message, and the card is built to carry it at 168px. It sits under the celebration, above No thanks."
        step="Proposed"
      >
        <StreakScreen />
      </Variant>
    </Category>

    <Category
      covers="#6360 · achievement cards and celebration moments"
      title="Achievements"
      verdict="The artwork is already designed to be looked at. The only question is whether we wait to be asked."
    >
      <Variant
        headline="Snapshot on the card"
        note="Built and live. Overlaid on the artwork in Primary weight, because Float disappears over a full-bleed image."
        step="Proposed"
      >
        <AchievementScreen />
      </Variant>
    </Category>

    <Category
      covers="#6359 · leaderboard row"
      title="Your leaderboard rank"
      verdict="The shipped control is `opacity-0 group-hover:opacity-100` at XSmall Float, pinned right with ml-auto. It works on desktop and does not exist on touch: the third hover-gated share control in the product, after the achievement card and the squad directory card."
    >
      <Variant
        headline="Snapshot revealed on your row"
        note="Built and live. The snapshot fades in on the right of your row. Clean on desktop, completely absent on mobile."
        step="Proposed"
      >
        <RankScreen />
      </Variant>
    </Category>

    <Category
      covers="TopReaderBadgeModal.tsx · milestone-rewards tier ladder · ListAwardsModal.tsx"
      title="Win moments with no share route"
      verdict="Three more moments, each one ending in a dismiss. All three are status with no destination, so snapshot is the only action that fits: the same argument as the streak and the achievement above."
    >
      <Variant
        headline="Top reader badge, download only"
        note="The clearest gap on this page. ‘You've earned the top reader badge!’ already generates an image server-side for the Download button, so the payload exists and nothing shares it. Same failure as the DevCard: generated, saved to a downloads folder, never posted."
        step="Proposed"
      >
        <TopReaderScreen />
      </Variant>
      <Variant
        headline="Streak tier milestones, ten of them, none shareable"
        note="The milestone-rewards ladder gives every tier its own 3D flame, name and headline. The celebration panel is the whole card already. A named tier is more quotable than a number, and nothing currently shares it."
        step="Proposed"
      >
        <StreakTierScreen />
      </Variant>
      <Variant
        headline="Being awarded, the only win that came from someone else"
        note="Someone spent cores on your post. ListAwardsModal shows who gave what and the cores total, and the recipient gets no way to mark it. A win handed over by another person is usually more shareable, not less, and it names them, which gives the card a second reason to travel."
        step="Proposed"
      >
        <AwardedScreen />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof StatusMoments> = {
  title: 'Features/Snapshot/Surfaces/Status moments',
  component: StatusMoments,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const Variations: StoryObj<typeof StatusMoments> = {};
