import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { userEvent, waitFor, within } from 'storybook/test';
import {
  StartupsCheckout,
  StartupsCheckoutStep,
} from '@dailydotdev/shared/src/features/squads/components/checkout/StartupsCheckout';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders, {
  bootAsAnonymous,
} from '../../extension/_providers';

// Group A of the daily.dev for Startups checkout: every screen of the Account
// step. Each story mounts the real checkout signed out and clicks the real
// buttons to reach its screen. Only the auth API and Cloudflare's Turnstile
// check are mocked.

type Canvas = ReturnType<typeof within>;
type Play = NonNullable<Story['play']>;

const EMAIL = 'founder@acme.dev';

const clickButton = async (canvas: Canvas, name: RegExp): Promise<void> => {
  await userEvent.click(await canvas.findByRole('button', { name }));
};

// Named "Signup using email" for screen readers on the sign-up options
const openEmailForm = (canvas: Canvas) =>
  clickButton(canvas, /continue with email|signup using email/i);

const typeInto = async (name: string, value: string): Promise<void> => {
  const input = await waitFor(() => {
    const field = document.querySelector<HTMLInputElement>(
      `input[name="${name}"]`,
    );

    if (!field) {
      throw new Error(`No ${name} field yet`);
    }

    return field;
  });

  await userEvent.type(input, value);
};

const fillAndSubmitEmailForm = async (canvas: Canvas): Promise<void> => {
  await openEmailForm(canvas);
  await typeInto('traits.email', EMAIL);
  await typeInto('traits.name', 'Sam Founder');
  await typeInto('password', 'correct-horse-battery');
  await typeInto('traits.username', 'samfounder');
  await clickButton(canvas, /^sign up$/i);
};

const openLogIn = (canvas: Canvas) => clickButton(canvas, /^log in$/i);

const openEmailLogIn = async (canvas: Canvas): Promise<void> => {
  await openLogIn(canvas);
  await openEmailForm(canvas);
  await typeInto('identifier', EMAIL);
};

const submitLogIn = async (canvas: Canvas): Promise<void> => {
  await typeInto('password', 'not-my-password');
  await clickButton(canvas, /^log in$/i);
};

const play =
  (steps: (canvas: Canvas) => Promise<void>): Play =>
  async ({ canvasElement }) =>
    steps(within(canvasElement));

/** The sign-up form waits for a Turnstile token before it sends anything. */
const stubTurnstile = (): void => {
  const turnstile = {
    ready: (callback: () => void) => callback(),
    render: () => 'story-widget',
    getResponse: () => 'story-token',
    reset: () => undefined,
    remove: () => undefined,
    isExpired: () => false,
  };

  // The setter keeps Cloudflare's real script from replacing the stub.
  Object.defineProperty(window, 'turnstile', {
    configurable: true,
    get: () => turnstile,
    set: () => undefined,
  });
};

const signUpWorks = http.post('*/auth/sign-up/email', () =>
  HttpResponse.json({ user: { id: 'new-founder' }, status: true }),
);

const signUpEmailTaken = http.post('*/auth/sign-up/email', () =>
  HttpResponse.json(
    { code: 'USER_ALREADY_EXISTS', message: 'User already exists' },
    { status: 422 },
  ),
);

const wrongCode = http.post('*/auth/email-otp/verify-email', () =>
  HttpResponse.json(
    { code: 'INVALID_OTP', message: 'Invalid OTP' },
    { status: 400 },
  ),
);

const wrongPassword = http.post('*/auth/sign-in/email', () =>
  HttpResponse.json(
    {
      code: 'INVALID_EMAIL_OR_PASSWORD',
      message: 'Invalid email or password',
    },
    { status: 401 },
  ),
);

// An unverified account signs in, then boots as a visitor who must verify.
const logInUnverified = http.post('*/auth/sign-in/email', () => {
  getBootMock.mockReturnValue({
    ...defaultBootData,
    user: {
      id: 'anonymous-visitor',
      shouldVerify: true,
      email: EMAIL,
    },
    accessToken: { token: '1', expiresIn: '1' },
    visit: { sessionId: '1', visitId: '1' },
    feeds: [],
  });

  return HttpResponse.json({ token: 'story', user: { id: 'unverified' } });
});

const meta: Meta = {
  title: 'Features/Squads/daily.dev for Startups states/A. Account',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  beforeEach: () => {
    bootAsAnonymous();
    stubTurnstile();
  },
  render: () => (
    <ExtensionProviders>
      <div className="min-h-screen bg-background-default">
        <StartupsCheckout
          initialPlan={SquadPlan.Starter}
          initialStep={StartupsCheckoutStep.Account}
        />
        <Toast autoDismissNotifications={false} />
      </div>
    </ExtensionProviders>
  ),
};

export default meta;

type Story = StoryObj;

const phone = {
  theme: 'dark',
  viewport: { value: 'mobile2', isRotated: false },
};

export const SignUpOptions: Story = { name: 'A1. Sign-up options' };

export const SignUpOptionsPhone: Story = {
  name: 'A1. Sign-up options, phone',
  globals: phone,
};

export const EmailForm: Story = {
  name: 'A2. Email form',
  play: play(openEmailForm),
};

export const EmailFormPhone: Story = {
  ...EmailForm,
  name: 'A2. Email form, phone',
  globals: phone,
};

export const EmailTaken: Story = {
  name: 'A2. Email already has an account',
  parameters: { msw: { handlers: [signUpEmailTaken] } },
  play: play(fillAndSubmitEmailForm),
};

export const EmailCode: Story = {
  name: 'A3. Email code',
  parameters: { msw: { handlers: [signUpWorks] } },
  play: play(fillAndSubmitEmailForm),
};

export const EmailCodePhone: Story = {
  ...EmailCode,
  name: 'A3. Email code, phone',
  globals: phone,
};

export const EmailCodeWrong: Story = {
  name: 'A3. Wrong code',
  parameters: { msw: { handlers: [signUpWorks, wrongCode] } },
  play: play(async (canvas) => {
    await fillAndSubmitEmailForm(canvas);
    const [firstDigit] = await canvas.findAllByRole('textbox');
    await userEvent.click(firstDigit);
    await userEvent.keyboard('123456');
  }),
};

export const LogInOptions: Story = {
  name: 'A4. Log-in options',
  play: play(openLogIn),
};

export const LogInOptionsPhone: Story = {
  ...LogInOptions,
  name: 'A4. Log-in options, phone',
  globals: phone,
};

export const LogInEmail: Story = {
  name: 'A4. Log in with email',
  play: play(openEmailLogIn),
};

export const LogInWrongPassword: Story = {
  name: 'A4. Wrong password',
  parameters: { msw: { handlers: [wrongPassword] } },
  play: play(async (canvas) => {
    await openEmailLogIn(canvas);
    await submitLogIn(canvas);
  }),
};

/** Log in › Sign up › Continue with email, for someone with no account. */
export const EmailFormFromLogIn: Story = {
  name: 'A2. Email form, from log-in',
  play: play(async (canvas) => {
    await openLogIn(canvas);
    await clickButton(canvas, /^sign up$/i);
    await openEmailForm(canvas);
    await canvas.findByRole('button', { name: /other options/i });
  }),
};

/** An account that never verified its email logs in and gets the code. */
export const EmailCodeFromLogIn: Story = {
  name: 'A3. Email code, from log-in',
  parameters: { msw: { handlers: [logInUnverified] } },
  play: play(async (canvas) => {
    await openEmailLogIn(canvas);
    await submitLogIn(canvas);
    await canvas.findByText('Verify your email');
  }),
};

export const ResetPassword: Story = {
  name: 'A5. Reset password',
  play: play(async (canvas) => {
    await openEmailLogIn(canvas);
    await clickButton(canvas, /forgot password/i);
    await canvas.findByText('Reset password');
  }),
};

export const ResetPasswordPhone: Story = {
  ...ResetPassword,
  name: 'A5. Reset password, phone',
  globals: phone,
};

export const EmailMissingFields: Story = {
  name: 'A2. Missing fields',
  play: play(async (canvas) => {
    await openEmailForm(canvas);
    await typeInto('traits.email', EMAIL);
    await clickButton(canvas, /^sign up$/i);
  }),
};

export const ResetLinkSent: Story = {
  name: 'A5. Reset link sent',
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/request-password-reset', () =>
          HttpResponse.json({ status: true }),
        ),
      ],
    },
  },
  play: play(async (canvas) => {
    await openEmailLogIn(canvas);
    await clickButton(canvas, /forgot password/i);
    await clickButton(canvas, /send reset link/i);
  }),
};

const stubPopup = (): void => {
  window.open = (() => ({
    close: () => undefined,
    location: { href: '' },
    closed: false,
  })) as unknown as typeof window.open;
};

export const SocialInProgress: Story = {
  name: 'A1. Social sign-up in progress',
  beforeEach: () => {
    bootAsAnonymous();
    stubTurnstile();
    stubPopup();
  },
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/sign-in/social', async () => {
          await delay('infinite');
          return HttpResponse.json({});
        }),
      ],
    },
  },
  play: play((canvas) => clickButton(canvas, /continue with github/i)),
};

export const SocialFailed: Story = {
  name: 'A1. Social sign-up failed',
  beforeEach: () => {
    bootAsAnonymous();
    stubTurnstile();
    stubPopup();
  },
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/sign-in/social', () =>
          HttpResponse.json({ message: 'Failed' }, { status: 500 }),
        ),
      ],
    },
  },
  play: play((canvas) => clickButton(canvas, /continue with github/i)),
};
