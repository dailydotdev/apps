import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import RegistrationForm from '@dailydotdev/shared/src/components/auth/RegistrationForm';
import { SocialRegistrationForm } from '@dailydotdev/shared/src/components/auth/SocialRegistrationForm';
import { SocialProvider } from '@dailydotdev/shared/src/components/auth/common';
import { AuthDataProvider } from '@dailydotdev/shared/src/contexts/AuthDataContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { FunnelStepTopBar } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepTopBar';
import ExtensionProviders from '../../extension/_providers';

/**
 * The two account-details screens on `/onboarding`, which are meant to be the
 * same screen — the social one differs only by the avatar above the fields.
 * Compare them side by side after touching either.
 */
const meta: Meta = {
  title: 'Components/Onboarding/Signup account details',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// Copied from the page's `isAuthenticating` branch, so the story shows the
// screen at the width and offsets production gives it.
const AuthShell = ({ children }: PropsWithChildren): ReactElement => (
  <ExtensionProviders>
    <AuthDataProvider initialEmail="ido@daily.dev">
      <div className="relative z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden">
        <FunnelStepTopBar />
        <div className="relative z-2 flex w-full flex-grow flex-col flex-wrap justify-center px-4 pt-3 tablet:flex-row tablet:gap-10 tablet:px-6">
          <div className="h-full w-full rounded-none tablet:max-w-[30rem]">
            {children}
          </div>
        </div>
      </div>
    </AuthDataProvider>
  </ExtensionProviders>
);

export const Email: Story = {
  name: '1. Email signup',
  render: () => (
    <AuthShell>
      <RegistrationForm
        simplified
        isOnboardingFunnel
        showHeadline={false}
        trigger={AuthTriggers.Onboarding}
        onSignup={fn()}
        onUpdateHints={fn()}
      />
    </AuthShell>
  ),
};

export const Social: Story = {
  name: '2. Social signup',
  render: () => (
    <AuthShell>
      <SocialRegistrationForm
        simplified
        isOnboardingFunnel
        provider={SocialProvider.Google}
        hints={{}}
        onSignup={fn()}
        onUpdateHints={fn()}
      />
    </AuthShell>
  ),
};
