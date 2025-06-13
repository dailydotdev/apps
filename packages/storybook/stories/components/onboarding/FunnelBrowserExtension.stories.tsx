import type { Meta, StoryObj } from '@storybook/react-vite';
import { FunnelBrowserExtension } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelBrowserExtension';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared';
import ExtensionProviders from '../../extension/_providers';
import { fn } from 'storybook/test';

const meta: Meta<typeof FunnelBrowserExtension> = {
  title: 'Components/Onboarding/Steps/BrowserExtension',
  component: FunnelBrowserExtension,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  render: (props) => (
    <ExtensionProviders>
      <div className="flex flex-col min-h-dvh">
        <FunnelStepBackground step={props}>
          <FunnelBrowserExtension {...props} />
        </FunnelStepBackground>
      </div>
    </ExtensionProviders>
  ),
};

export default meta;

type Story = StoryObj<typeof FunnelBrowserExtension>;

const defaultArgs = {
  id: 'browser-extension-step',
  type: FunnelStepType.BrowserExtension,
  transitions: [],
  parameters: {
    headline: 'Transform every new tab into a learning powerhouse',
    explainer:
      'Unlock the power of every new tab with daily.dev extension. Personalized feed, developer communities, AI search and more!',
  },
  onTransition: fn(),
};

export const Default: Story = {
  args: defaultArgs as any,
};
