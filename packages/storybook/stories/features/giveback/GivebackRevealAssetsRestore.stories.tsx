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
import { GivebackMascot } from '@dailydotdev/shared/src/features/giveback/components/GivebackMascot';
import { GivebackCampaignVideo } from '@dailydotdev/shared/src/features/giveback/components/GivebackCampaignVideo';
import { cloudinaryGivebackFunnelImpact } from '@dailydotdev/shared/src/lib/image';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { MOCK_USER, withGiveback } from './giveback.mocks';

// Dedicated review surface for the reveal-asset restoration PR: the bespoke
// assets that were dropped to placeholders in the merged reveals PR (#6289) are
// wired back to their real media.daily.dev URLs. These stories render the REAL
// production components (`RewardRevealContent`, `GivebackFoundingAward`) on the
// real pop-up surface, so what you review is what ships.
//
// What changed in this PR:
// • Picture with Patchy — static charm placeholder → the bespoke transparent
//   selfie VIDEO (PersonaMascot pattern: VP9-alpha WebM for most browsers, an
//   HEVC-alpha .mov for Safari — both transparent). Idle shows the video on its
//   first frame; "Take a selfie" plays it once; the result composites your photo
//   into the card Patchy holds.
// • Founding award — placeholder charm → the real "IMPACT AMBASSADOR" Patchy
//   from the award library.
// • Council seat — neutral grey tiles → real teammate Slack avatars + a
//   "daily.dev Council" Slack pill above the ring.
// • Warm-up funnel finale ("You're in. Now every action funds them.") — the
//   bookmarks charm → Patchy holding a Cores coin.
// • Campaign video poster (funnel first step) — the charm-with-glow poster →
//   the composed "Community Impact" thumbnail, full-bleed.

const user = MOCK_USER as unknown as LoggedUser;

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

const PATCHY_TIER = tier(
  'picture-with-patchy',
  ContributionRewardType.PatchyPicture,
  'Picture with Patchy',
);

const COUNCIL_TIER = tier(
  'council-seat',
  ContributionRewardType.Council,
  'Seat on the daily.dev council',
  {
    description: 'Join the daily.dev council and help steer the product.',
  },
);

const RevealCard = ({
  reveal,
  levelNumber,
}: {
  reveal: ReturnType<typeof resolveRewardReveal>;
  levelNumber?: number;
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

const SectionHeading = ({
  title,
  note,
}: {
  title: string;
  note: string;
}): ReactElement => (
  <FlexCol className="gap-1">
    <Typography tag={TypographyTag.H2} bold type={TypographyType.Title3}>
      {title}
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Secondary}>
      {note}
    </Typography>
  </FlexCol>
);

const meta: Meta = {
  title: 'Features/Giveback/PR — Restored assets',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Review surface for the giveback asset PR. Restores/updates the bespoke Patchy selfie video (transparent VP9-alpha WebM + HEVC-alpha .mov), the founding-award Patchy, the council teammate avatars + Slack pill, the warm-up funnel finale image, and the campaign video poster — all placeholders in the merged reveals PR. Real components, real surfaces.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj;

export const PatchySelfie: Story = {
  render: () => (
    <FlexCol className="gap-4">
      <SectionHeading
        title="Picture with Patchy — selfie video"
        note='Click "Take a selfie" to play the video, then see your photo composited into the card Patchy holds. WebM for most browsers, HEVC-alpha .mov for Safari.'
      />
      <div className="max-w-md">
        <RevealCard reveal={resolveRewardReveal(PATCHY_TIER)} levelNumber={6} />
      </div>
    </FlexCol>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Both sources are transparent — a VP9-alpha WebM for most browsers and an HEVC-alpha .mov for Safari — so Patchy floats cleanly on the pop-up surface in every browser.',
      },
    },
  },
};

export const FoundingAward: Story = {
  render: () => (
    <FlexCol className="gap-4">
      <SectionHeading
        title="Founding award — IMPACT AMBASSADOR Patchy"
        note='Click "Claim your award" for the celebration. The award art is now the real asset from the award library.'
      />
      <div className="mx-auto max-w-2xl">
        <GivebackFoundingAward initialState="claimable" />
      </div>
    </FlexCol>
  ),
};

export const CouncilSeat: Story = {
  render: () => (
    <FlexCol className="gap-4">
      <SectionHeading
        title="Council seat — real teammate avatars + Slack pill"
        note='Real daily.dev teammate Slack avatars in the ring (you stand out in the gradient frame), under a "daily.dev Council" Slack pill.'
      />
      <div className="max-w-md">
        <RevealCard reveal={resolveRewardReveal(COUNCIL_TIER)} levelNumber={9} />
      </div>
    </FlexCol>
  ),
};

export const FunnelFinale: Story = {
  render: () => (
    <FlexCol className="gap-4">
      <SectionHeading
        title="Warm-up funnel finale — Patchy with a Cores coin"
        note={`Shown at "You're in. Now every action funds them." — swapped from the bookmarks charm to Patchy holding a Cores coin.`}
      />
      <div className="flex justify-center rounded-16 bg-surface-float p-10">
        <GivebackMascot
          imageClassName="h-28 tablet:h-36"
          image={{
            src: cloudinaryGivebackFunnelImpact,
            alt: 'Patchy holding a Cores coin, celebrating your causes',
          }}
        />
      </div>
    </FlexCol>
  ),
};

export const CampaignVideoPoster: Story = {
  render: () => (
    <FlexCol className="gap-4">
      <SectionHeading
        title="Campaign video poster — funnel first step"
        note='The video thumbnail on the intro step, swapped from the charm-with-glow poster to the composed "Community Impact" scene. Click to play the embed.'
      />
      <div className="mx-auto w-full max-w-xl">
        <GivebackCampaignVideo />
      </div>
    </FlexCol>
  ),
};

export const AllRestoredAssets: Story = {
  render: () => (
    <FlexCol className="gap-6">
      <FlexCol className="gap-1">
        <Typography tag={TypographyTag.H2} bold type={TypographyType.Title2}>
          Restored reveal assets
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Everything this PR wires back from placeholder to the real asset.
        </Typography>
      </FlexCol>
      <div className="grid items-start gap-6 laptop:grid-cols-2">
        <div className="max-w-md">
          <RevealCard
            reveal={resolveRewardReveal(PATCHY_TIER)}
            levelNumber={6}
          />
        </div>
        <div className="max-w-md">
          <RevealCard
            reveal={resolveRewardReveal(COUNCIL_TIER)}
            levelNumber={9}
          />
        </div>
        <div className="flex justify-center rounded-16 bg-surface-float p-10">
          <GivebackMascot
            imageClassName="h-28 tablet:h-36"
            image={{
              src: cloudinaryGivebackFunnelImpact,
              alt: 'Patchy holding a Cores coin, celebrating your causes',
            }}
          />
        </div>
        <div className="laptop:col-span-2">
          <GivebackCampaignVideo />
        </div>
        <div className="laptop:col-span-2">
          <GivebackFoundingAward initialState="claimable" />
        </div>
      </div>
    </FlexCol>
  ),
};
