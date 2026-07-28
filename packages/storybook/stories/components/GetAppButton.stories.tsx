import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GetAppButton } from '@dailydotdev/shared/src/features/getApp/components/GetAppButton';
import { GetAppQrCode } from '@dailydotdev/shared/src/features/getApp/components/GetAppQrCode';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { BellIcon } from '@dailydotdev/shared/src/components/icons';

const queryClient = new QueryClient();

const meta: Meta<typeof GetAppButton> = {
  title: 'Components/GetAppButton',
  component: GetAppButton,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-96 bg-background-default p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  // Storybook has no GrowthBook instance, so the flag is forced on here.
  args: { isFeatureEnabled: true },
};

export default meta;
type Story = StoryObj<typeof GetAppButton>;

// Mirrors the real header shell so the trigger can be judged in context rather
// than floating on an empty canvas.
const HeaderShell = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="flex h-16 w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4">
    <span className="font-bold text-text-primary typo-title3">daily.dev</span>
    <div className="ml-auto flex items-center justify-end gap-3">{children}</div>
  </div>
);

export const InHeaderLoggedIn: Story = {
  render: (args) => (
    <HeaderShell>
      <GetAppButton {...args} />
      <Button
        variant={ButtonVariant.Float}
        className="w-10 justify-center"
        icon={<BellIcon />}
        aria-label="Notifications"
      />
      <div className="size-8 rounded-10 bg-surface-float" />
    </HeaderShell>
  ),
};

// Stands in for the real LoginButton, which renders a Secondary "Log in" and a
// Primary "Sign up" side by side inside a `gap-4` span.
const AuthButtons = (): React.ReactElement => (
  <span className="flex flex-row gap-4">
    <Button variant={ButtonVariant.Secondary}>Log in</Button>
    <Button variant={ButtonVariant.Primary}>Sign up</Button>
  </span>
);

export const InHeaderLoggedOut: Story = {
  args: { showLabel: true },
  render: (args) => (
    <HeaderShell>
      <GetAppButton {...args} />
      <AuthButtons />
    </HeaderShell>
  ),
};

// Same slot, icon-only. Worth comparing: with Log in AND Sign up already in the
// row, a third labelled button competes with Sign up, which is the CTA that
// actually matters to a logged-out visitor.
export const InHeaderLoggedOutCompact: Story = {
  args: { showLabel: false },
  render: (args) => (
    <HeaderShell>
      <GetAppButton {...args} />
      <AuthButtons />
    </HeaderShell>
  ),
};

// The panel is the part worth reviewing closely; this pins it open next to the
// bare QR so contrast can be checked against both themes.
export const Panel: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      <p className="text-text-tertiary typo-footnote">
        Click the phone button to open the panel.
      </p>
      <HeaderShell>
        <GetAppButton {...args} />
      </HeaderShell>
      <GetAppQrCode className="size-40" />
    </div>
  ),
};
