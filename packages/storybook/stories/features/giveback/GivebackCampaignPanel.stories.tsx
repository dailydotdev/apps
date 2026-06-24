import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackCampaignPanel } from '@dailydotdev/shared/src/features/giveback/components/GivebackCampaignPanel';
import { withGiveback } from './giveback.mocks';

// The "Campaign" (why) tab: the emotional budget story, the visitor's selected
// causes, and the FAQ. Reads the cause picker (causes + saved picks) and status.
const meta: Meta<typeof GivebackCampaignPanel> = {
  title: 'Features/Giveback/Campaign tab',
  component: GivebackCampaignPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The "why" tab. Shows the budget story, your picked causes, and the FAQ.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackCampaignPanel>;

export const WithPickedCauses: Story = {
  decorators: [
    withGiveback({ selectedCauseIds: ['c-oss', 'c-access', 'c-docs'] }),
  ],
};

export const NoPicksYet: Story = {
  decorators: [withGiveback({ selectedCauseIds: [] })],
};
