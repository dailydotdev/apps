import type { Meta, StoryObj } from '@storybook/react';
import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';

const meta: Meta<typeof AdGrid> = {
  title: 'Components/Cards/Ads/AdGrid',
  component: AdGrid,
  args: {
    ad: {
      description: 'Ad Description',
      image: 'https://via.placeholder.com/150',
      link: 'https://daily.dev',
      source: 'Carbon',
      company: 'Ad Company',
      referralLink: 'https://daily.dev',
    }
  }
};

export default meta;

type Story = StoryObj<typeof AdGrid>;

export const Default: Story = {
  name: 'AdGrid',
};
