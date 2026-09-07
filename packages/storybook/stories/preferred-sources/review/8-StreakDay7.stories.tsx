import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  CoreIcon,
  GoogleIcon,
  ShieldPlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ReviewProviders } from './_providers';
import { milestones } from './milestone/data';
import type { StreakMilestone } from './milestone/data';
import {
  DayStrip,
  EmberPanel,
  FlameBadge,
  MomentShell,
  NoThanks,
  StreakCount,
  TierName,
} from './milestone/moment';
import { NoOfferMoment, OptionRow } from './milestone/StreakPopups';
import { RewardMotion } from './milestone/shell';

type Args = { variant: 'current' | 'proposed' };

/**
 * Day 7 · Flame, from the milestone-rewards exploration. Today, when no partner
 * offer matches, the popup hands out a streak freeze. Agreed shape: the
 * family's three-row list — freeze, Google, Cores — every action primary.
 */
const Celebration = ({ milestone }: { milestone: StreakMilestone }) => (
  <EmberPanel className="mr-side mr-side-center mr-side-pad flex-col items-center justify-center gap-4 border-r border-border-subtlest-tertiary p-6 text-center">
    <FlameBadge milestone={milestone} className="mr-flame" />
    <TierName milestone={milestone} />
    <div className="flex flex-col gap-1">
      <span className="mr-streak-line flex items-baseline justify-center gap-2 text-text-primary">
        <StreakCount day={milestone.day} />
        <span className="font-normal">day streak</span>
      </span>
      <h2 className="typo-title3">{milestone.headline}</h2>
    </div>
    <DayStrip className="mr-hide-tiny" />
  </EmberPanel>
);

const Right = ({ children }: { children: React.ReactNode }) => (
  <div className="mr-side-pad flex min-w-0 flex-1 flex-col justify-center gap-4 p-6">
    {children}
  </div>
);

/**
 * The list shape the family already uses for freezes, restores and Cores:
 * three rows, one small button each, the Google row carrying the primary.
 */
const GoogleListMoment = ({ milestone }: { milestone: StreakMilestone }) => (
  <MomentShell onClose={fn()} width="w-full max-w-[46rem]" className="mr-split">
    <Celebration milestone={milestone} />
    <Right>
      <div className="flex flex-col gap-1">
        <h3 className="mr-balance font-bold typo-title2">Day 7 unlocked</h3>
        <p className="mr-pretty text-text-tertiary typo-callout">
          Nothing sponsored today. Three things from us instead.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <OptionRow
          primary
          icon={<ShieldPlusIcon size={IconSize.Small} secondary />}
          title="A streak freeze"
          meta="Covers one missed day"
          action="Claim"
          onAction={fn()}
        />
        <OptionRow
          primary
          icon={<GoogleIcon secondary className="size-5" />}
          title="Add as preferred source"
          meta="See daily.dev in your Google results"
          action="Add"
          onAction={fn()}
        />
        <OptionRow
          primary
          icon={<CoreIcon size={IconSize.Small} />}
          title="10 Cores"
          meta="Spend them on awards"
          action="Claim"
          onAction={fn()}
        />
      </div>
      <p className="text-text-quaternary typo-caption1">
        Not sponsored. You can change the Google setting any time.
      </p>
      <NoThanks onClick={fn()} className="mr-only-narrow" />
    </Right>
  </MomentShell>
);

const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/8. Streak popup: day 7',
  args: { variant: 'proposed' },
  argTypes: {
    variant: { control: 'radio', options: ['current', 'gift', 'strip'] },
  },
  parameters: { layout: 'fullscreen' },
  render: ({ variant }) => (
    <ReviewProviders loggedIn>
      <RewardMotion />
      <div className="mr-shell flex min-h-screen items-center justify-center bg-background-default p-6 text-text-primary">
        {variant === 'current' && (
          <NoOfferMoment
            milestone={milestones.week}
            onClaim={fn()}
            onKeep={fn()}
            onClose={fn()}
          />
        )}
        {variant === 'proposed' && (
          <GoogleListMoment milestone={milestones.week} />
        )}
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Current: StoryObj<Args> = { args: { variant: 'current' } };
export const Proposed: StoryObj<Args> = { args: { variant: 'proposed' } };
