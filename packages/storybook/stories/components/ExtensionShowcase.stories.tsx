import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtensionShowcase } from '@dailydotdev/shared/src/components/onboarding/ExtensionShowcase/ExtensionShowcase';

const meta: Meta<typeof ExtensionShowcase> = {
  title: 'Components/Onboarding/ExtensionShowcase',
  component: ExtensionShowcase,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <div className="mx-auto max-w-screen-laptop p-6">
      <ExtensionShowcase {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof ExtensionShowcase>;

export const Default: Story = {
  args: {
    title: 'Everything daily.dev does in your browser',
    description:
      'A quick tour of what the extension unlocks the moment you install it.',
  },
};

export const WithoutHeader: Story = {
  args: {},
};

export const CustomCta: Story = {
  args: {
    title: 'Make every tab count',
    ctaLabel: 'Get it for Chrome',
  },
};
