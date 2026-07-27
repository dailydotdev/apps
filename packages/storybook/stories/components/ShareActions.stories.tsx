import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import { fn } from 'storybook/test';
import { withShareProviders } from '../share/shareStoryContext';

const meta: Meta<typeof ShareActions> = {
  title: 'Components/Share/ShareActions',
  component: ShareActions,
  args: {
    link: 'https://daily.dev/posts/how-to-ship-fast',
    text: 'Check out this post on daily.dev',
    onShare: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['icon', 'inline'],
      description:
        'icon = copy-icon trigger with a popover (desktop) / native share (mobile); inline = the social row rendered directly',
    },
    openOnHover: {
      control: 'boolean',
      description: 'Desktop only: reveal the popover on hover as well as click',
    },
    label: { control: 'text' },
    link: { control: 'text' },
    text: { control: 'text' },
  },
  decorators: [
    withShareProviders('flex min-h-40 w-full items-center justify-center'),
  ],
};

export default meta;

type Story = StoryObj<typeof ShareActions>;

// Icon trigger — click to open the share popover on desktop; a single tap opens
// the native share sheet on mobile.
export const Icon: Story = {
  args: { variant: 'icon' },
};

// Popover also opens on hover (desktop) for the feed-card share-out pattern.
export const IconOpenOnHover: Story = {
  args: { variant: 'icon', openOnHover: true },
};

// The full social row, for headers / share strips / drawers.
export const Inline: Story = {
  args: { variant: 'inline' },
};
