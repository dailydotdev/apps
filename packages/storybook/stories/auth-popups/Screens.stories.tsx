import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AuthDisplay,
  SocialProvider,
} from '@dailydotdev/shared/src/components/auth/common';
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

// Fills the Log in form the way a person would and submits it. Storybook has
// no auth API, so a submitted password comes back as a wrong password.
const submitLogin = async (values: {
  identifier: string;
  password: string;
}): Promise<void> => {
  const startedAt = Date.now();
  let form: HTMLFormElement | null = null;
  while (!form && Date.now() - startedAt < 5000) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 100));
    form = document.querySelector<HTMLFormElement>(
      'form[aria-label="Login using email and password"]',
    );
  }
  if (!form) {
    return;
  }

  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  Object.entries(values).forEach(([name, value]) => {
    const input = form?.elements.namedItem(name) as HTMLInputElement;
    setValue?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  form.requestSubmit();
};

export const LogInFieldErrors: Story = {
  render: () => (
    <Providers>
      <AuthPopup isLogin />
    </Providers>
  ),
  play: () => submitLogin({ identifier: 'ada.lovelace.dev', password: '' }),
};

export const LogInWrongPassword: Story = {
  render: () => (
    <Providers>
      <AuthPopup isLogin />
    </Providers>
  ),
  play: () =>
    submitLogin({ identifier: DEMO_EMAIL, password: 'analytical-engine' }),
};

export const WelcomeBackGoogle: Story = {
  render: () => (
    <Providers rememberedProvider={SocialProvider.Google}>
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
