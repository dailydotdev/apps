import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import type { PopupProps } from './harness';
import {
  AuthPopup,
  DEMO_EMAIL,
  FullPageLogin,
  mockLoggedOutWebapp,
  Providers,
} from './harness';

// The real screens the variant pages frame at phone and desktop sizes. They
// stay out of the sidebar; each page links the ones it shows.
const meta: Meta<PopupProps & { triggerKey: keyof typeof AuthTriggers }> = {
  title: 'Auth Pop-ups/Screens',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  beforeEach: mockLoggedOutWebapp,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const SignUp: Story = {
  args: { triggerKey: 'MainButton' },
  argTypes: {
    triggerKey: { control: 'select', options: Object.keys(AuthTriggers) },
  },
  render: ({ triggerKey }) => (
    <Providers>
      <AuthPopup trigger={AuthTriggers[triggerKey]} />
    </Providers>
  ),
};

export const LogIn: Story = {
  render: () => (
    <Providers>
      <AuthPopup isLogin />
    </Providers>
  ),
};

export const WelcomeBackGoogle: Story = {
  render: () => (
    <Providers rememberedProvider="google">
      <AuthPopup />
    </Providers>
  ),
};

export const WelcomeBackPassword: Story = {
  render: () => (
    <Providers rememberedProvider="password">
      <AuthPopup />
    </Providers>
  ),
};

export const EmailSignUp: Story = {
  render: () => (
    <Providers>
      <AuthPopup email={DEMO_EMAIL} />
    </Providers>
  ),
};

export const VerifyEmail: Story = {
  render: () => (
    <Providers>
      <AuthPopup
        email={DEMO_EMAIL}
        defaultDisplay={AuthDisplay.EmailVerification}
      />
    </Providers>
  ),
};

export const ForgotPassword: Story = {
  render: () => (
    <Providers>
      <AuthPopup
        isLogin
        email={DEMO_EMAIL}
        defaultDisplay={AuthDisplay.ForgotPassword}
      />
    </Providers>
  ),
};

export const LoginPage: Story = {
  render: () => (
    <Providers>
      <FullPageLogin />
    </Providers>
  ),
};

export const LightSignUp: Story = {
  globals: { theme: 'light' },
  render: () => (
    <Providers>
      <AuthPopup />
    </Providers>
  ),
};
