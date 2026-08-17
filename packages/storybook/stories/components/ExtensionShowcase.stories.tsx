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
  args: {},
};

export const CustomCta: Story = {
  args: {
    ctaLabel: 'Add daily.dev to Chrome — free',
  },
};

export const StartOnBrief: Story = {
  args: {
    defaultFeatureId: 'brief',
  },
};
