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

const StreakScreen = ({ spot }: { spot: 'today' | 'share' | 'milestone' }) => (
  <Screen>
    <div className="relative flex flex-col items-center gap-3 p-6 text-center">
      <Button
        aria-label="Close"
        className="absolute right-3 top-3"
        icon={<MiniCloseIcon />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
      />
      <span className="text-[3rem] leading-none">🔥</span>
      <span className="font-bold text-text-primary typo-title2">100</span>
      <span className="font-bold text-text-primary typo-callout">
        day reading streak
      </span>
      <span className="text-text-tertiary typo-footnote">
        {spot === 'milestone' ? 'Your longest yet' : 'Keep it going tomorrow'}
      </span>
      {spot === 'today' ? (
        <Button
          className="mt-2"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
        >
          Keep reading
        </Button>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <Button size={ButtonSize.Small} variant={ButtonVariant.Float}>
            Keep reading
          </Button>
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        </div>
      )}
    </div>
  </Screen>
);

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
      <div className="relative overflow-hidden rounded-12 bg-surface-float">
        <img alt="" className="h-44 w-full object-cover" src={ART} />
        {spot !== 'today' && (
          <div className="absolute right-2 top-2">
            <Control action="Snapshot" variant={ButtonVariant.Primary} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-footnote">
            Can&apos;t spend it all
          </span>
          <span className="text-text-tertiary typo-caption1">
            {spot === 'celebration'
              ? 'Only 4% of readers get here'
              : 'Unlocked 12 Aug 2026'}
          </span>
        </div>
        {spot === 'celebration' && (
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        )}
      </div>
    </div>
  </Screen>
);

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

      <span className="font-bold text-text-primary typo-footnote">
        Highest level
      </span>

      {['Bobby Iliev', 'Ante Barić', 'Ido Shamun'].map((name, index) => (
        <div
          key={name}
          className={`flex items-center gap-3 rounded-10 px-2 py-2 ${
            index === 0 && spot === 'hover' ? 'bg-surface-float' : ''
          }`}
        >
          <span className="w-5 font-bold text-text-tertiary typo-caption1">
            #{index + 1}
          </span>
          <img
            alt=""
            className="size-7 rounded-full object-cover"
            src={AVATAR}
          />
          <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
            {name}
          </span>
          {index === 0 && spot === 'hover' ? (
            <Control action="Snapshot" />
          ) : (
            <span className="font-bold text-text-tertiary typo-caption1">
              {103 - index * 4}
            </span>
          )}
        </div>
      ))}
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
      verdict="Hover reveal is invisible on touch. Whatever we ship has to work without a mouse."
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
        note="Built and live. Clean on desktop, and completely absent on mobile — which is most of the audience."
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
