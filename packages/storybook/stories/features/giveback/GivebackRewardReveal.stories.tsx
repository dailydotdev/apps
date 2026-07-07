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
import { resolveRewardReveal } from '@dailydotdev/shared/src/features/giveback/components/rewards/rewardReveal';
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

// Sample reward tiers, one per reveal. Each resolves from its reward type and
// per-type metadata (see `resolveRewardReveal`).
const tier = (
  id: string,
  rewardType: ContributionRewardType,
  title: string,
  {
    description = null,
    metadata = {},
  }: Partial<Pick<ContributionRewardTier, 'description' | 'metadata'>> = {},
): ContributionRewardTier => ({
  id,
  title,
  description,
  thresholdPoints: 100,
  rewardType,
  metadata,
});

const SAMPLE_TIERS: ReadonlyArray<{
  label: string;
  tier: ContributionRewardTier;
}> = [
  {
    label: 'Joke note',
    tier: tier(
      'parents-proud',
      ContributionRewardType.Joke,
      'Your parents will be proud of you.',
      {
        description:
          'You turned everyday scrolling into real donations. Somewhere, a parent is telling a neighbor about you right now.',
      },
    ),
  },
  {
    label: 'Picture with Patchy',
    tier: tier(
      'picture-with-patchy',
      ContributionRewardType.PatchyPicture,
      'Picture with Patchy',
    ),
  },
  {
    label: 'daily.dev secret',
    tier: tier(
      'daily-dev-secret',
      ContributionRewardType.Trivia,
      'A secret, unlocked',
      {
        description:
          'The color palette is food-themed. There is genuinely a shade called "bacon".',
      },
    ),
  },
  {
    label: 'Cores',
    tier: tier('cores-1000', ContributionRewardType.Cores, '1,000 Cores', {
      metadata: { amount: 1000 },
    }),
  },
  {
    label: 'Plus',
    tier: tier(
      'plus-1-year',
      ContributionRewardType.PlusDays,
      '1 year of Plus',
      { metadata: { days: 365 } },
    ),
  },
  {
    label: 'Store discount',
    tier: tier(
      'store-discount',
      ContributionRewardType.StoreDiscount,
      '50% off the swag store',
      { metadata: { percent: 50 } },
    ),
  },
  {
    label: 'Suggest a cause',
    tier: tier(
      'suggest-a-cause',
      ContributionRewardType.SuggestCauses,
      'Suggest a cause',
      {
        description:
          'Nominate a nonprofit or open-source fund. If it fits, it joins the causes everyone can donate to.',
      },
    ),
  },
  {
    label: 'Council',
    tier: tier('council', ContributionRewardType.Council, 'daily.dev Council', {
      description:
        'A seat next to the daily.dev team, in the channels where we decide what to build next.',
    }),
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
      <RewardRevealContent
        reveal={reveal}
        levelNumber={levelNumber}
        user={user}
      />
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
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
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
