import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons';
import {
  ART,
  AVATAR,
  Category,
  Control,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

/**
 * NewStreakModal: a reminder switch and close at the top, the fire art with
 * the count overlaid in typo-tera, a title, one line of copy, the freeze
 * upsell, and an opt-out checkbox. No share control, and no primary button.
 */
const StreakScreen = ({ spot }: { spot: 'today' | 'share' | 'milestone' }) => (
  <Screen>
    <div className="relative flex flex-col items-center gap-2 p-6 text-center">
      <div className="flex h-10 w-full items-center justify-between">
        <span className="flex items-center gap-2 text-text-tertiary typo-footnote">
          <span className="h-4 w-7 rounded-8 bg-accent-cabbage-default" />
          Remind me
        </span>
        <Button
          aria-label="Close"
          icon={<MiniCloseIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
      </div>

      <span className="relative flex items-center justify-center">
        <span className="text-[6rem] leading-none">🔥</span>
        <strong className="absolute text-text-primary typo-tera">100</strong>
      </span>

      <strong className="mt-6 text-text-primary typo-title1">
        {spot === 'milestone' ? 'New streak record!' : '100 days streak'}
      </strong>
      <p className="mt-3 text-text-secondary typo-body">
        {spot === 'milestone'
          ? 'Epic win! You are in a league of your own'
          : 'New milestone reached! You are unstoppable.'}
      </p>

      <span className="mt-6 text-text-link typo-footnote">
        Protect your streak with streak freezes
      </span>

      {spot !== 'today' && (
        <Control
          action="Snapshot"
          className="mt-6"
          label
          variant={ButtonVariant.Primary}
        />
      )}

      <span className="mt-6 flex items-center gap-2 text-text-tertiary typo-footnote">
        <span className="size-4 rounded-4 border border-border-subtlest-tertiary" />
        Never show this again
      </span>
    </div>
  </Screen>
);

/**
 * AchievementCard: a 48px thumbnail, name and description, then the snapshot
 * button and the points. The snapshot is `opacity-0 group-hover:opacity-100`,
 * so it is invisible until hover — and permanently invisible on touch.
 */
const AchievementScreen = ({
  spot,
}: {
  spot: 'today' | 'card' | 'celebration';
}) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      {spot === 'celebration' && (
        <span className="font-bold uppercase text-accent-cabbage-default typo-caption2">
          Just unlocked
        </span>
      )}

      <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div className="flex items-start gap-3">
          <img alt="" className="size-12 shrink-0 rounded-12 object-cover" src={ART} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              Can&apos;t spend it all
            </span>
            <span className="mt-0.5 line-clamp-2 text-text-tertiary typo-footnote">
              Hold more than 10,000 cores without spending any of them.
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 self-center">
            {spot !== 'today' && (
              <Control
                action="Snapshot"
                size={ButtonSize.XSmall}
                variant={
                  spot === 'celebration'
                    ? ButtonVariant.Primary
                    : ButtonVariant.Float
                }
              />
            )}
            <span className="font-bold text-text-primary typo-callout">
              120
            </span>
          </div>
        </div>

        {spot !== 'celebration' && (
          <div className="flex flex-col gap-1">
            <span className="flex justify-between text-text-tertiary typo-footnote">
              <span>Progress</span>
              <span>8/10</span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-14 bg-surface-invert">
              <span className="block h-full w-4/5 rounded-14 bg-accent-cabbage-default" />
            </span>
          </div>
        )}
      </div>
    </div>
  </Screen>
);

/**
 * UserTopList rows: a w-14 tabular score, TopRankBadge, an optional level
 * ring, then UserHighlight (32px avatar, caption1 name, caption2 handle).
 * The snapshot is `opacity-0 group-hover:opacity-100` at XSmall Float —
 * shipped, and invisible on touch.
 */
const RankScreen = ({ spot }: { spot: 'today' | 'hover' | 'band' }) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      {spot === 'band' && (
        <div className="flex items-center gap-3 rounded-12 border border-accent-cabbage-default bg-overlay-float-cabbage p-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              You&apos;re #1 this week
            </span>
            <span className="text-text-tertiary typo-caption1">
              Highest level · 103
            </span>
          </div>
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        </div>
      )}

      <h3 className="mb-2 font-bold text-text-primary typo-title3">
        Highest level
      </h3>

      <ol className="flex flex-col gap-1.5 typo-body">
        {[
          ['Bobby Iliev', 'bobbyiliev', 103],
          ['Ante Barić', 'antebaric', 99],
          ['Ido Shamun', 'idoshamun', 95],
        ].map(([name, handle, score], index) => (
          <li
            key={handle as string}
            className={`group flex w-full flex-row items-center rounded-8 px-2 ${
              index === 0 && spot === 'hover'
                ? 'bg-accent-pepper-subtler'
                : ''
            }`}
          >
            <span className="inline-flex w-14 shrink-0 justify-center tabular-nums text-text-quaternary">
              {score}
            </span>
            <span className="flex size-6 shrink-0 items-center justify-center text-text-tertiary typo-caption1">
              {index === 0 ? '🥇' : `#${index + 1}`}
            </span>
            <div className="flex min-w-0 shrink items-center gap-2 p-2">
              <img
                alt=""
                className="size-8 rounded-full object-cover"
                src={AVATAR}
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
            {index === 0 && spot === 'hover' && (
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

const StatusMoments = () => (
  <SurfacePage
    intro="Three surfaces that share one property: there is no page to send anyone to. A link to your streak, your rank or your unlocked achievement means nothing to the person receiving it. Snapshot is not the louder option here — it is the only one."
    map="Sharing map: lead with Snapshot on all three (#6358 streak, #6360 achievements, #6359 rank). Copy link is not a secondary option, it is absent, because there is nothing to link to."
    title="Status moments"
  >
    <Category
      covers="#6358 · streak popup"
      title="Reading streak"
      verdict="Placement is settled; frequency is the real lever. Every day dulls it — 10 / 50 / 100 keeps it an event."
    >
      <Variant
        headline="A popup you dismiss"
        note="The milestone is announced and then thrown away."
        step="Today"
      >
        <StreakScreen spot="today" />
      </Variant>
      <Variant
        headline="Snapshot beside Keep reading"
        note="Recommended. The number is the entire message, and the card is built to carry it at 168px."
        step="Recommended"
      >
        <StreakScreen spot="share" />
      </Variant>
      <Variant
        headline="Milestones only, with the framing to match"
        note="Same control, rarer trigger, better copy. ‘Your longest yet’ is a reason to share; ‘keep it going’ is a reason to close."
        step="Push"
      >
        <StreakScreen spot="milestone" />
      </Variant>
    </Category>

    <Category
      covers="#6360 · achievement cards and celebration moments"
      title="Achievements"
      verdict="The artwork is already designed to be looked at. The only question is whether we wait to be asked."
    >
      <Variant
        headline="Unlock, then nothing"
        note="The achievement lands in a grid and the moment passes unshared."
        step="Today"
      >
        <AchievementScreen spot="today" />
      </Variant>
      <Variant
        headline="Snapshot on the card"
        note="Built and live. Overlaid on the artwork in Primary weight — Float disappears over a full-bleed image."
        step="Recommended"
      >
        <AchievementScreen spot="card" />
      </Variant>
      <Variant
        headline="The celebration opens itself"
        note="Highest-visibility option in the whole set: the offer arrives without being sought. Also the most interruptive, so gate it to rare unlocks."
        step="Push"
      >
        <AchievementScreen spot="celebration" />
      </Variant>
    </Category>

    <Category
      covers="#6359 · leaderboard row"
      title="Your leaderboard rank"
      verdict="The shipped control is `opacity-0 group-hover:opacity-100` at XSmall Float, pinned right with ml-auto. It works on desktop and does not exist on touch — the third hover-gated share control in the product, after the achievement card and the squad directory card."
    >
      <Variant
        headline="Nothing on your own row"
        note="Placing on a leaderboard is a status moment that currently ends in silence."
        step="Today"
      >
        <RankScreen spot="today" />
      </Variant>
      <Variant
        headline="Snapshot revealed on your row"
        note="Built and live. The row is score, rank badge, avatar, name and handle; the snapshot fades in on the right. Clean on desktop, completely absent on mobile — which is most of the audience."
        step="Recommended"
      >
        <RankScreen spot="hover" />
      </Variant>
      <Variant
        headline="A rank band above the board"
        note="Works everywhere, states the offer outright, and names the achievement instead of making people infer it from a highlighted row."
        step="Push"
      >
        <RankScreen spot="band" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof StatusMoments> = {
  title: 'Features/Snapshot/Surfaces/Status moments',
  component: StatusMoments,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof StatusMoments> = {};
