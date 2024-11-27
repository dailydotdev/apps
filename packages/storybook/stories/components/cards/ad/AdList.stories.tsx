import type { Meta, StoryObj } from '@storybook/react';
import { AdList } from '@dailydotdev/shared/src/components/cards/ad/AdList';
import ExtensionProviders from '../../../extension/_providers';

const meta: Meta<typeof AdList> = {
  title: 'Components/Cards/Ads/AdList',
  component: AdList,
  args: {
    ad: {
      description: 'Ad Description',
      image: 'https://via.placeholder.com/150',
      link: 'https://daily.dev',
      source: 'Carbon',
      company: 'Ad Company',
      referralLink: 'https://daily.dev',
    },
  },
  render: (props) => (
    <ExtensionProviders>
      <AdList {...props} />
    </ExtensionProviders>
  ),
};

export default meta;

type Story = StoryObj<typeof AdList>;

export const Default: Story = {
  name: 'AdList',
};
