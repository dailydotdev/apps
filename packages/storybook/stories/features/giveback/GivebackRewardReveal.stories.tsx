import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { ContributionRewardTier } from '@dailydotdev/shared/src/features/giveback/types';
import { ContributionRewardType } from '@dailydotdev/shared/src/features/giveback/types';
import {
  RevealSurface,
  RewardRevealContent,
} from '@dailydotdev/shared/src/features/giveback/components/rewards/GivebackRewardReveal';
import {
  resolveRewardReveal,
  RevealSlug,
} from '@dailydotdev/shared/src/features/giveback/components/rewards/rewardReveal';
import { GivebackFoundingAward } from '@dailydotdev/shared/src/features/giveback/components/rewards/GivebackFoundingAward';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { MOCK_USER, withGiveback } from './giveback.mocks';

// The reward-claim reveals: the cinematic pop-up shown after a contributor
// claims a reward on the journey. Each reward tier resolves (via
// `resolveRewardReveal`) to a bespoke payoff — see the individual reveals below.
// Wired into the real claim flow in `GivebackPersonalRoadmap`.

const user = MOCK_USER as unknown as LoggedUser;

// Sample reward tiers, one per reveal. Bespoke reveals are matched by the tier
// id (see `RevealSlug`); the rest derive from the reward type + copy.
const tier = (
  id: string,
  rewardType: ContributionRewardType,
  title: string,
  description: string | null = null,
): ContributionRewardTier => ({
  id,
  title,
  description,
  thresholdPoints: 100,
  rewardType,
});

const SAMPLE_TIERS: ReadonlyArray<{ label: string; tier: ContributionRewardTier }> =
  [
    {
      label: 'Custom note',
      tier: tier(
        'parents-proud',
        ContributionRewardType.Custom,
        'Your parents will be proud of you.',
        'You turned everyday scrolling into real donations. Somewhere, a parent is telling a neighbor about you right now.',
      ),
    },
    {
      label: 'Roast',
      tier: tier(RevealSlug.Roast, ContributionRewardType.Custom, 'Get roasted'),
    },
    {
      label: 'Picture with Patchy',
      tier: tier(
        RevealSlug.PatchyPicture,
        ContributionRewardType.Custom,
        'Picture with Patchy',
      ),
    },
    {
      label: 'daily.dev secret',
      tier: tier(RevealSlug.Secret, ContributionRewardType.Custom, 'daily.dev secret'),
    },
    {
      label: 'Cores',
      tier: tier('cores-1000', ContributionRewardType.Cores, '1,000 Cores'),
    },
    {
      label: 'Plus',
      tier: tier('plus-1-year', ContributionRewardType.PlusDays, '1 year of Plus'),
    },
    {
      label: 'Call with the team',
      tier: tier(
        'team-call',
        ContributionRewardType.Call,
        'A call with the team',
        'Shape the product with a 1:1.',
      ),
    },
    {
      label: 'Swag discount',
      tier: tier(
        RevealSlug.Swag,
        ContributionRewardType.Custom,
        '50% off the swag store',
      ),
    },
    {
      label: 'Suggest a cause',
      tier: tier(
        RevealSlug.SuggestCause,
        ContributionRewardType.Privilege,
        'Suggest a cause',
      ),
    },
    {
      label: 'Council',
      tier: tier(RevealSlug.Council, ContributionRewardType.Privilege, 'daily.dev Council'),
    },
    {
      label: 'Privilege',
      tier: tier(
        'founding-badge',
        ContributionRewardType.Privilege,
        'Founding contributor badge',
        'A permanent mark on your profile.',
      ),
    },
  ];

const meta: Meta = {
  title: 'Features/Giveback/Reward reveals',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every claim reveal, in one place. In the product these open as a pop-up after a successful claim on the journey; here each is shown on the same shared surface so previews match the real pop-up.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj;

const RevealCard = ({
  reveal,
  levelNumber,
}: {
  reveal: ReturnType<typeof resolveRewardReveal>;
  levelNumber: number;
}): ReactElement => (
  <RevealSurface>
    <div className="px-6 py-8">
      <RewardRevealContent reveal={reveal} levelNumber={levelNumber} user={user} />
    </div>
  </RevealSurface>
);

export const Gallery: Story = {
  render: () => (
    <FlexCol className="gap-6">
      <FlexCol className="gap-1">
        <Typography tag={TypographyTag.H2} bold type={TypographyType.Title2}>
          Every claim reveal
        </Typography>
        <Typography type={TypographyType.Callout} color={TypographyColor.Secondary}>
          The payoff behind each Claim button.
        </Typography>
      </FlexCol>
      <div className="grid gap-6 laptop:grid-cols-2">
        {SAMPLE_TIERS.map(({ tier: sample }, index) => (
          <RevealCard
            key={sample.id}
            reveal={resolveRewardReveal(sample)}
            levelNumber={index + 1}
          />
        ))}
      </div>
    </FlexCol>
  ),
};

export const FoundingAwardIntro: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl">
      <GivebackFoundingAward initialState="intro" />
    </div>
  ),
};

export const FoundingAwardClaimable: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl">
      <GivebackFoundingAward initialState="claimable" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Click "Claim your award" to see the founding-award celebration (award pop + Cores + note from the CEO).',
      },
    },
  },
};

export const FoundingAwardClaimed: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl">
      <GivebackFoundingAward initialState="claimed" />
    </div>
  ),
};

export const FoundingAwardSoldOut: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl">
      <GivebackFoundingAward initialState="soldOut" claimedCount={1000} />
    </div>
  ),
};
