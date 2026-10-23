import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  MailIcon,
  MoveToIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { CodeField } from '@dailydotdev/shared/src/components/fields/CodeField';
import {
  FunnelGlassBar,
  funnelGlassBarCta,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelGlassBar';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { onboardingHeadlineClasses } from '@dailydotdev/shared/src/components/onboarding/common';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { FunnelStepCtaWrapper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { FunnelStepTopBar } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepTopBar';
import { StepHeadline } from '@dailydotdev/shared/src/features/onboarding/shared/StepHeadline';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import {
  mockOnboardingRouter,
  OnboardingAuthPage,
  OnboardingHero,
  Providers,
} from './harness';
import {
  Checklist,
  DesktopFrame,
  Labeled,
  Page,
  PhoneFrame,
  Section,
} from './kit';

const meta: Meta = {
  title: 'Onboarding Fixes/2b. Header options',
  parameters: { layout: 'fullscreen', themes: { themeOverride: 'dark' } },
  beforeEach: mockOnboardingRouter,
};

export default meta;

const ID = 'onboarding-fixes-2b-header-options';

export const Overview: StoryObj = {
  name: 'Read me',
  render: () => (
    <Page
      eyebrow="Header consistency"
      title="Where the back button goes"
      intro={
        <>
          Every step after signup has the same header: the logo top left, an
          optional text action (Skip) top right, then a centred title. The two
          screens before it, the email form and verify, are the only ones with a
          way back. Each frame is cropped to the header and the first lines
          below it.
        </>
      }
    >
      <Section title="Today">
        {rows.map((row) => (
          <HeaderRow key={row.id} {...row} />
        ))}
      </Section>
      <Section title="Options for the email form">
        {options.map((option) => (
          <HeaderRow key={option.id} {...option} />
        ))}
      </Section>
      <Section title="Why A">
        <Checklist
          items={[
            {
              done: true,
              text: 'The top bar keeps one shape on every onboarding screen: the logo top left, an optional text action on the right; the email form only adds the arrow in front.',
            },
            {
              done: true,
              text: 'Back is top left, where people look for it, and nothing else in the layout moves.',
            },
            {
              done: true,
              text: 'It is the funnel’s own back arrow, so no new style, and the logo stays on screen right after it.',
            },
            {
              done: true,
              text: 'Verify keeps the logo and “Change email”: once the account exists, going back really means fixing the address.',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};

const Onboarding = ({ children }: { children: ReactNode }): ReactElement => (
  <FunnelProgressContext.Provider
    value={{
      chapters: [{ steps: 6 }],
      position: { chapter: 0, step: 2 },
      isOnboarding: true,
    }}
  >
    <div className="flex min-h-dvh flex-col bg-background-default text-text-primary">
      {children}
    </div>
  </FunnelProgressContext.Provider>
);

// The steps after signup, drawn with the wrapper every one of them uses.
const RealStep = ({
  headline,
  description,
  skip,
}: {
  headline: string;
  description: string;
  skip?: string;
}): ReactElement => (
  <Onboarding>
    <FunnelStepCtaWrapper
      isGlass
      onClick={fn()}
      skip={skip ? { cta: skip, onClick: fn() } : undefined}
    >
      <div className="mx-auto flex w-full max-w-[32rem] flex-col gap-6 px-6 pt-3">
        <StepHeadline heading={headline} description={description} />
        <div className="h-40 rounded-16 bg-surface-float" />
      </div>
    </FunnelStepCtaWrapper>
  </Onboarding>
);

const Fields = (): ReactElement => (
  <>
    <TextField
      inputId="email"
      label="Email"
      leftIcon={<MailIcon />}
      defaultValue="ada@lovelace.dev"
    />
    <TextField inputId="name" label="Name" leftIcon={<UserIcon />} />
  </>
);

// The expanded email form's frame from OnboardingSignupHero, so every option
// sits on the same canvas, column and spacing as the live screen.
const EmailForm = ({
  topBar,
  aboveTitle,
  titleRow,
  footer,
}: {
  topBar: ReactNode;
  aboveTitle?: ReactNode;
  titleRow?: ReactNode;
  footer?: ReactNode;
}): ReactElement => (
  <Onboarding>
    {topBar}
    <main className="relative z-2 flex w-full flex-1 flex-col items-center px-5 pb-6 pt-3">
      <div className="flex w-full max-w-[440px] flex-col gap-6 tablet:gap-7">
        {aboveTitle}
        {titleRow ?? <h2 className={onboardingHeadlineClasses}>Sign up</h2>}
        <div className="flex flex-col gap-4">
          <Fields />
        </div>
        {footer && <div className="flex flex-col gap-3">{footer}</div>}
      </div>
    </main>
  </Onboarding>
);

const borderedBack = (
  <Button
    aria-label="Go back"
    className="border-border-subtlest-tertiary text-text-secondary"
    icon={<ArrowIcon className="-rotate-90" />}
    onClick={fn()}
    size={ButtonSize.Medium}
    type="button"
    variant={ButtonVariant.Secondary}
  />
);

export const StepWithSkip: StoryObj = {
  name: 'Real · step with Skip',
  render: () => (
    <RealStep
      headline="Transform every new tab into a learning powerhouse"
      description="Get the extension and your feed opens with every new tab."
      skip="Skip"
    />
  ),
};

export const StepNoSkip: StoryObj = {
  name: 'Real · step without Skip',
  render: () => (
    <RealStep
      headline="Pick tags that are relevant to you"
      description="Choose at least five so your feed starts in the right place."
    />
  ),
};

export const EmailToday: StoryObj = {
  name: 'Email form · this branch',
  render: () => (
    <Providers isAuthenticating={false}>
      <OnboardingHero />
    </Providers>
  ),
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByText(
      'Continue with email',
      {},
      { timeout: 10000 },
    );
    await userEvent.click(button);
  },
};

export const VerifyToday: StoryObj = {
  name: 'Verify · this branch',
  render: () => (
    <Providers>
      <OnboardingAuthPage defaultDisplay={AuthDisplay.EmailVerification} />
    </Providers>
  ),
};

export const OptionA: StoryObj = {
  name: 'A · Arrow, then the logo (this branch)',
  render: () => <EmailForm topBar={<FunnelStepTopBar onBack={fn()} />} />,
};

export const OptionB: StoryObj = {
  name: 'B · "Back" in the Skip slot',
  render: () => (
    <EmailForm
      topBar={<FunnelStepTopBar skip={{ cta: 'Back', onClick: fn() }} />}
    />
  ),
};

export const OptionC: StoryObj = {
  name: 'C · Bordered back on the title row',
  render: () => (
    <EmailForm
      topBar={<FunnelStepTopBar />}
      titleRow={
        <div className="relative flex items-center">
          <div className="absolute left-0">{borderedBack}</div>
          <h2 className={onboardingHeadlineClasses}>Sign up</h2>
        </div>
      }
    />
  ),
};

export const OptionD: StoryObj = {
  name: 'D · "← Back" above the title',
  render: () => (
    <EmailForm
      topBar={<FunnelStepTopBar />}
      aboveTitle={
        <Button
          className="-mb-2 -ml-3 self-start"
          icon={<ArrowIcon className="-rotate-90" size={IconSize.Small} />}
          onClick={fn()}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Tertiary}
        >
          Back
        </Button>
      }
    />
  ),
};

// E: the way back sits in the glass bar beside the main action, the "back +
// continue" pair multi-step forms use. Header and title stay untouched.
const ctaBack = (
  <Button
    aria-label="Go back"
    icon={<MoveToIcon size={IconSize.Small} className="rotate-180" />}
    onClick={fn()}
    size={ButtonSize.Medium}
    type="button"
    variant={ButtonVariant.Float}
  />
);

const CtaBar = ({ label }: { label: string }): ReactElement => (
  <FunnelGlassBar>
    {ctaBack}
    <Button
      className={funnelGlassBarCta}
      onClick={fn()}
      size={ButtonSize.Medium}
      type="button"
      variant={ButtonVariant.Primary}
    >
      {label}
    </Button>
  </FunnelGlassBar>
);

export const OptionE: StoryObj = {
  name: 'E · Back beside the main CTA',
  render: () => (
    <EmailForm
      topBar={<FunnelStepTopBar />}
      footer={
        <>
          <CtaBar label="Sign up" />
          <p className="text-center text-text-tertiary typo-caption1">
            By continuing, you agree to the Terms of Service and Privacy Policy.
          </p>
          <p className="text-center text-text-tertiary typo-callout">
            Already have an account?{' '}
            <span className="text-text-primary underline">Log in</span>
          </p>
        </>
      }
    />
  ),
};

export const OptionEVerify: StoryObj = {
  name: 'E · Verify with back beside Verify',
  render: () => (
    <Onboarding>
      <FunnelStepTopBar />
      <main className="relative z-2 flex w-full flex-1 flex-col items-center px-5 pb-6 pt-3">
        <div className="flex w-full max-w-[30rem] flex-col items-center gap-2">
          <MailIcon size={IconSize.XXLarge} className="mx-auto mb-2" />
          <h2 className={onboardingHeadlineClasses}>Verify your email</h2>
          <div className="flex w-full flex-col items-center gap-2 py-8">
            <p className="text-center text-text-tertiary typo-body">
              We sent a 6-digit code to{' '}
              <strong className="text-text-primary">ada@lovelace.dev</strong>
            </p>
            <p className="text-center text-text-tertiary typo-footnote">
              Don&apos;t see it? Also check your spam or junk folder.
            </p>
          </div>
          <CodeField onSubmit={fn()} />
          <p className="mb-8 mt-4 text-text-tertiary typo-body">
            Didn&apos;t get a verification code?{' '}
            <span className="text-text-disabled">Resend code 57s</span>
          </p>
          <div className="w-full">
            <CtaBar label="Verify" />
          </div>
        </div>
      </main>
    </Onboarding>
  ),
};

const rows: {
  id: string;
  label: string;
  tone?: 'before' | 'after';
}[] = [
  { id: 'step-with-skip', label: 'Real step · with Skip' },
  { id: 'step-no-skip', label: 'Real step · without Skip' },
  { id: 'email-today', label: 'Email form · this branch', tone: 'before' },
  { id: 'verify-today', label: 'Verify email · this branch' },
];

const options: {
  id: string;
  label: string;
  tone?: 'after';
  note: string;
}[] = [
  {
    id: 'option-a',
    label: 'A · Arrow, then the logo (this branch) · recommended',
    tone: 'after',
    note: 'App-bar order with a 16px gap, so the arrow reads as its own control. Same corner and row height as every step.',
  },
  {
    id: 'option-b',
    label: 'B · “Back” in the Skip slot',
    note: 'Header pixel-identical to the steps: logo left, a text action right. But back on the right is not where people look.',
  },
  {
    id: 'option-c',
    label: 'C · Bordered back on the title row',
    note: 'Header untouched. The back button the email form already had on main, now level with the title at the column’s left edge.',
  },
  {
    id: 'option-e',
    label: 'E · Back beside the main CTA',
    note: 'Header and title untouched. The way back sits with the action, in the glass bar, where the thumb already is on a phone.',
  },
  {
    id: 'option-e-verify',
    label: 'E · Same on verify (back to the email form)',
    note: 'Verify gets the same pair, so both auth screens match. “Change email” could then go.',
  },
  {
    id: 'option-d',
    label: 'D · “← Back” above the title',
    note: 'Header untouched and the most explicit label, but it adds a row and pushes the title down.',
  },
];

const HeaderRow = ({
  id,
  label,
  tone,
  note,
}: {
  id: string;
  label: string;
  tone?: 'before' | 'after';
  note?: string;
}): ReactElement => (
  <Labeled label={label} tone={tone}>
    {note && <p className="text-text-tertiary typo-callout">{note}</p>}
    <div className="flex flex-col gap-4 laptop:flex-row laptop:items-start">
      <div className="min-w-0 flex-1">
        <DesktopFrame
          storyId={`${ID}--${id}`}
          title={`${label} on desktop`}
          height={300}
        />
      </div>
      <PhoneFrame
        storyId={`${ID}--${id}`}
        title={`${label} on a phone`}
        height={260}
      />
    </div>
  </Labeled>
);
