import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { MOCK_USER, withGiveback } from '../giveback.mocks';
import { RewardJourneyPlayground } from './RewardJourneyPlayground';
import { RewardRevealContent, RevealSurface } from './RewardReveal';
import { FoundingAwardCard } from './FoundingAward';
import { PLAYGROUND_TIERS } from './rewardsPlayground.data';
import type { FoundingAwardState } from './rewardsPlayground.data';

// PLAYGROUND for iterating on the giveback reward journey before it goes into
// the live product: ordering, thresholds, copy, and the unique per-tier claim
// reveals. Not wired to the backend — everything is mocked.

const mockUser = MOCK_USER as unknown as LoggedUser;

const meta: Meta = {
  title: 'Features/Giveback/Rewards playground',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Design sandbox for the reworked reward-tier journey. Ordering principles pulled from the research pass:',
          '',
          '- An easy, delightful first win at the top (goal-gradient / endowed-progress effect).',
          '- Cheap, frequent **fun** rewards (jokes, Patchy, trivia, roast) interleaved with rarer tangible **perks** (Cores, Plus, swag).',
          '- Insider **privilege** gated high — a say in the product is the prestige, not a freebie (the developer-ambassador-program pattern).',
          '- One bold summit: the daily.dev Council.',
          '',
          'Use **Journey** to scrub points and walk the ladder; click Claim on any unlocked tier to trigger its reveal. Use **Reveal gallery** to see every payoff at once, or the individual reveal stories to inspect one closely.',
        ].join('\n'),
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj;

export const Journey: Story = {
  render: (args) => (
    <RewardJourneyPlayground
      user={mockUser}
      userPoints={(args as { userPoints: number }).userPoints}
      claimedTierIds={(args as { claimedTierIds: string[] }).claimedTierIds}
    />
  ),
  args: {
    userPoints: 900,
    claimedTierIds: ['parents-proud', 'cores-250', 'trivia'],
  },
  argTypes: {
    userPoints: { control: { type: 'range', min: 0, max: 15500, step: 100 } },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Scrub points to move along the ladder. Click "Claim reward" on any unlocked tier to open its unique reveal.',
      },
    },
  },
};

export const FreshStart: Story = {
  render: () => <RewardJourneyPlayground user={mockUser} userPoints={0} />,
  parameters: {
    docs: {
      description: {
        story:
          'Straight after onboarding: the founding-award step is the hero, in its "take your first action to reserve a spot" intro state.',
      },
    },
  },
};

export const EarlyJourney: Story = {
  render: () => <RewardJourneyPlayground user={mockUser} userPoints={60} />,
  parameters: {
    docs: {
      description: {
        story:
          'First contribution in: the founding award is now claimable, and the first points tier ("parents will be proud") is next.',
      },
    },
  },
};

export const MidJourney: Story = {
  render: () => (
    <RewardJourneyPlayground
      user={mockUser}
      userPoints={3500}
      claimedTierIds={[
        'parents-proud',
        'cores-250',
        'trivia',
        'patchy-hug',
        'plus-1-week',
      ]}
    />
  ),
};

export const NearTheTop: Story = {
  render: () => (
    <RewardJourneyPlayground
      user={mockUser}
      userPoints={15500}
      claimedTierIds={PLAYGROUND_TIERS.slice(
        0,
        PLAYGROUND_TIERS.length - 1,
      ).map((tier) => tier.id)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Everything cleared, the Council summit ready to claim.',
      },
    },
  },
};

// A card wrapper so a reveal is inspectable standalone (outside the dialog).
// Uses the same RevealSurface as the real pop-up, so the preview matches 1:1.
const TierReveal = ({ id }: { id: string }): ReactElement => {
  const tier = PLAYGROUND_TIERS.find((item) => item.id === id);
  if (!tier) {
    throw new Error(`Unknown playground tier: ${id}`);
  }
  return (
    <RevealSurface className="mx-auto max-w-lg">
      <div className="px-8 py-10">
        <RewardRevealContent tier={tier} user={mockUser} />
      </div>
    </RevealSurface>
  );
};

export const RevealGallery: Story = {
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
          The payoff behind each Claim button, in ladder order.
        </Typography>
      </FlexCol>
      <div className="grid gap-6 laptop:grid-cols-2">
        {PLAYGROUND_TIERS.map((tier) => (
          <RevealSurface key={tier.id}>
            <div className="px-6 py-8">
              <RewardRevealContent tier={tier} user={mockUser} />
            </div>
          </RevealSurface>
        ))}
      </div>
    </FlexCol>
  ),
};

export const ParentsProud: Story = {
  render: () => <TierReveal id="parents-proud" />,
};
export const EarnHeaven: Story = { render: () => <TierReveal id="heaven" /> };
export const GetRoasted: Story = { render: () => <TierReveal id="roast" /> };
export const PictureWithPatchy: Story = {
  render: () => <TierReveal id="patchy-hug" />,
};
export const DailyDevSecrets: Story = {
  render: () => <TierReveal id="trivia" />,
};
export const Cores: Story = { render: () => <TierReveal id="cores-250" /> };
export const PlusOneYear: Story = {
  render: () => <TierReveal id="plus-1-year" />,
};
export const SwagDiscount: Story = {
  render: () => <TierReveal id="swag-discount" />,
};
export const SuggestACause: Story = {
  render: () => <TierReveal id="suggest-cause" />,
};
export const Council: Story = { render: () => <TierReveal id="council" /> };

// --- Founding award (the special first step) in each state -----------------

const FoundingCard = ({
  state,
  claimedCount,
}: {
  state: FoundingAwardState;
  claimedCount?: number;
}): ReactElement => (
  <div className="mx-auto max-w-2xl">
    <FoundingAwardCard
      user={mockUser}
      initialState={state}
      claimedCount={claimedCount}
    />
  </div>
);

export const FoundingAwardIntro: Story = {
  render: () => <FoundingCard state="intro" />,
  parameters: {
    docs: {
      description: {
        story:
          'Before the first action — spot not yet secured. Scarcity meter is the hook.',
      },
    },
  },
};

export const FoundingAwardClaimable: Story = {
  render: () => <FoundingCard state="claimable" />,
  parameters: {
    docs: {
      description: {
        story:
          'Contributed — a spot is theirs. Click "Claim your award" to see the founding-award celebration (award pop + 1,000 Cores + note from the CEO).',
      },
    },
  },
};

export const FoundingAwardClaimed: Story = {
  render: () => <FoundingCard state="claimed" />,
};

export const FoundingAwardSoldOut: Story = {
  render: () => <FoundingCard state="soldOut" claimedCount={1000} />,
  parameters: {
    docs: {
      description: {
        story: 'All 1,000 gone — the graceful "you just missed it" fallback.',
      },
    },
  },
};
