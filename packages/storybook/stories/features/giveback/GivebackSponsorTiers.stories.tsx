import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackSponsorTiers } from '@dailydotdev/shared/src/features/giveback/components/GivebackSponsorTiers';
import { mockSponsors, withGiveback } from './giveback.mocks';
import type { ContributionSponsor } from '@dailydotdev/shared/src/features/giveback/types';
import { ContributionSponsorTier } from '@dailydotdev/shared/src/features/giveback/types';

// The "Sponsored by" wall: brand logos grouped into gold / silver / bronze
// columns split by dividers. Logos are monochrome at rest and light up to full
// colour on hover; logo-less sponsors fall back to their name.
const meta: Meta<typeof GivebackSponsorTiers> = {
  title: 'Features/Giveback/Sponsor tiers',
  component: GivebackSponsorTiers,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hover a logo to reveal its real colours. Covers the full multi-tier wall, a gold-only wall, the logo-less fallback, and the empty state (renders nothing).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackSponsorTiers>;

export const AllTiers: Story = {
  decorators: [withGiveback({ sponsors: mockSponsors() })],
};

export const GoldOnly: Story = {
  decorators: [
    withGiveback({
      sponsors: mockSponsors().filter(
        (s) => s.tier === ContributionSponsorTier.Gold,
      ),
    }),
  ],
};

export const LogoLess: Story = {
  parameters: {
    docs: { description: { story: 'Sponsors without a logo show their name.' } },
  },
  decorators: [
    withGiveback({
      sponsors: [
        {
          id: 's-a',
          name: 'Acme Corp',
          amountCents: 200000,
          url: 'https://acme.test',
          logoUrl: null,
          tier: ContributionSponsorTier.Gold,
        },
        {
          id: 's-b',
          name: 'Dana K.',
          amountCents: 5000,
          url: null,
          logoUrl: null,
          tier: ContributionSponsorTier.Bronze,
        },
      ] as ContributionSponsor[],
    }),
  ],
};

export const Empty: Story = {
  parameters: {
    docs: { description: { story: 'No sponsors yet — the section renders nothing.' } },
  },
  decorators: [withGiveback({ sponsors: [] })],
};
