import type { ReactElement, ReactNode } from 'react';
import React, { cloneElement } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { providerMap } from '@dailydotdev/shared/src/components/auth/common';
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import { MemberAlready } from '@dailydotdev/shared/src/components/onboarding/MemberAlready';
import { MailIcon } from '@dailydotdev/shared/src/components/icons/Mail';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { FooterLinks } from '@dailydotdev/shared/src/components/footer/FooterLinks';
import { signupWallHorizon } from '@dailydotdev/shared/src/lib/image';
import { HERO_STYLES } from '@dailydotdev/shared/src/features/onboarding/components/signupHero/heroStyles';
import { ExtensionProviders, bootAsAnonymous } from '../extension/_providers';
import { DesktopFrame, PhoneFrame } from '../onboarding-fixes/kit';

const meta: Meta = {
  title: 'Login Surfaces/Aligned signup',
  parameters: { layout: 'fullscreen' },
  beforeEach: bootAsAnonymous,
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

// The marketing landing's sign-up block, the source of truth: headline, the
// three ways to sign up, the legal line under them and the log in link.
// On iOS, Apple takes GitHub's place: the App Store requires Sign in with
// Apple next to other social logins, and the app already offers it.
const LandingSignupBlock = ({
  align = 'left',
  isIOS = false,
}: {
  align?: 'left' | 'center';
  isIOS?: boolean;
}): ReactElement => {
  const secondProvider = isIOS ? providerMap.apple : providerMap.github;
  const ways = [
    {
      label: 'Continue with Google',
      icon: providerMap.google.icon,
      variant: ButtonVariant.Primary,
    },
    {
      label: `Continue with ${secondProvider.label}`,
      icon: isIOS
        ? secondProvider.icon
        : cloneElement(secondProvider.icon, { secondary: true }),
      variant: ButtonVariant.Float,
    },
    {
      label: 'Continue with email',
      icon: <MailIcon />,
      variant: ButtonVariant.Float,
    },
  ];

  return (
    <div className="flex w-full max-w-[26.25rem] flex-col">
      <h1
        className={classNames(
          'text-balance font-bold tracking-tight text-text-primary typo-large-title tablet:typo-mega3',
          align === 'center' && 'text-center',
        )}
      >
        Where developers discover what’s next.
      </h1>
      <div className="mt-8 flex flex-col gap-4">
        {ways.map(({ label, icon, variant }) => (
          <Button
            key={label}
            className={classNames(
              'w-full !font-normal',
              variant === ButtonVariant.Float &&
                '!border !border-border-subtlest-tertiary !text-text-primary',
            )}
            icon={icon}
            onClick={fn()}
            size={ButtonSize.Large}
            type="button"
            variant={variant}
          >
            {label}
          </Button>
        ))}
      </div>
      <SignupDisclaimer className="mt-6 !text-text-tertiary typo-caption1" />
      <MemberAlready
        onLogin={fn()}
        className={{
          container:
            'mx-auto mt-8 justify-center text-text-secondary typo-callout',
          login: '!text-text-primary',
        }}
      />
    </div>
  );
};

// `focus` is inline because the art's crop differs per shell.
const LandingArt = ({
  className,
  focus,
}: {
  className?: string;
  focus: string;
}): ReactElement => (
  <img
    alt=""
    aria-hidden
    className={classNames(
      'pointer-events-none absolute select-none object-cover',
      className,
    )}
    src={signupWallHorizon}
    style={{ objectPosition: focus }}
  />
);

// `/onboarding` at laptop width, which also serves the extension's hand-off.
// Same shell as today (centered logo, footer links row); the art and the
// inner block are the landing's.
const DesktopFunnel = (): ReactElement => (
  <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background-default text-text-primary">
    <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
    <LandingArt className="inset-0 -z-2 size-full" focus="100% 50%" />
    <div
      aria-hidden
      className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
    />
    <div
      aria-hidden
      className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[55vh]"
    />
    <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-center gap-7 px-5 pb-16 pt-14">
      <Logo
        position={LogoPosition.Relative}
        className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
        logoClassName={{ container: 'h-7' }}
      />
      <LandingSignupBlock />
    </main>
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-1 flex justify-end px-6 pb-4">
      <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-end">
        <FooterLinks />
      </div>
    </div>
  </div>
);

// The Android and iOS apps at phone width: the art across the top fading
// into the page, the logo, then the landing block anchored to the bottom.
const PhoneFunnel = ({ isIOS }: { isIOS?: boolean }): ReactElement => (
  <div className="relative isolate flex min-h-dvh w-full flex-col justify-end overflow-hidden bg-background-default px-5 pb-8 text-text-primary">
    <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-1 h-1/2 overflow-hidden"
    >
      <LandingArt className="inset-0 size-full" focus="64% 50%" />
      <div className="onb-art-fade absolute inset-x-0 bottom-0 h-3/5" />
    </div>
    <div className="flex flex-col items-center gap-6">
      <Logo
        position={LogoPosition.Relative}
        className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
        logoClassName={{ container: 'h-6' }}
      />
      <LandingSignupBlock align="center" isIOS={isIOS} />
    </div>
  </div>
);

export const Desktop: StoryObj = {
  name: '/onboarding · desktop',
  globals: { theme: 'dark' },
  render: () => <DesktopFunnel />,
};

export const Phone: StoryObj = {
  name: '/onboarding · phone',
  globals: { theme: 'dark' },
  render: () => <PhoneFunnel />,
};

export const IOS: StoryObj = {
  name: '/onboarding · iOS app',
  globals: { theme: 'dark' },
  render: () => <PhoneFunnel isIOS />,
};

// The iOS app's native launch screen (SplashImage in the iOS repo), with the
// landing art in place of the illustrated room. The art is a 1200x2310
// portrait recomposition of the landing hero, the size of the current
// SplashImage, so it can replace it as is. The app icon tile stays.
const IOSSplash = (): ReactElement => (
  <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background-default">
    <img
      alt=""
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-1 size-full select-none object-cover"
      src="/images/login-surfaces/ios-splash-landing-art-stars.jpg"
      style={{ objectPosition: '50% 100%' }}
    />
    <div className="flex size-16 items-center justify-center rounded-16 bg-background-default shadow-2">
      <LogoIcon className={{ container: 'h-7' }} />
    </div>
  </div>
);

// Apple's App Tracking Transparency alert, drawn over the aligned funnel. Its
// copy is the app's NSUserTrackingUsageDescription; the rest is system UI.
const IOSTrackingPrompt = (): ReactElement => (
  <div className="relative min-h-dvh w-full">
    <PhoneFunnel isIOS />
    <div className="absolute inset-0 z-3 flex items-center justify-center bg-overlay-quaternary-onion px-6">
      <div className="flex w-full max-w-[19rem] flex-col gap-3 rounded-24 bg-surface-float p-6 backdrop-blur-xl">
        <div className="flex size-12 items-center justify-center rounded-12 bg-accent-bun-default">
          <LogoIcon className={{ container: 'h-5' }} />
        </div>
        <p className="font-bold text-text-primary typo-callout">
          Allow “daily.dev” to track your activity across other companies’ apps
          and websites?
        </p>
        <p className="text-text-tertiary typo-footnote">
          Your data helps us measure the effectiveness of our advertising
          campaigns and improve how we reach new users.
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {['Ask App Not to Track', 'Allow'].map((label) => (
            <span
              key={label}
              className="flex h-11 items-center justify-center rounded-16 bg-surface-hover text-text-primary typo-callout"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const IOSSplashScreen: StoryObj = {
  name: 'iOS app · splash',
  globals: { theme: 'dark' },
  render: () => <IOSSplash />,
};

// The Android app's loading state, today an empty page with the logged-in
// bottom nav, showing the same art as the iOS splash.
export const AndroidLoading: StoryObj = {
  name: 'Android app · loading',
  globals: { theme: 'dark' },
  render: () => <IOSSplash />,
};

export const IOSTracking: StoryObj = {
  name: 'iOS app · tracking prompt',
  globals: { theme: 'dark' },
  render: () => <IOSTrackingPrompt />,
};

const img = (name: string): string => `/images/login-surfaces/${name}.jpg`;

const Column = ({
  label,
  tone,
  children,
}: {
  label: string;
  tone: 'truth' | 'before' | 'after';
  children: ReactNode;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-2">
    <figcaption
      className={classNames(
        'self-start rounded-8 px-2 py-0.5 font-bold typo-caption1',
        tone === 'truth' && 'bg-accent-cabbage-default text-white',
        tone === 'before' && 'bg-accent-ketchup-default text-white',
        tone === 'after' && 'bg-accent-avocado-default text-white',
      )}
    >
      {label}
    </figcaption>
    {children}
  </figure>
);

const Shot = ({
  file,
  phone,
}: {
  file: string;
  phone?: boolean;
}): ReactElement => (
  <img
    src={img(file)}
    alt=""
    className={classNames(
      'block rounded-16 border border-border-subtlest-tertiary',
      phone ? 'w-[24.375rem] max-w-full' : 'w-full',
    )}
  />
);

const Row = ({
  title,
  note,
  children,
}: {
  title: string;
  note: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-3">
      <h2 className="font-bold typo-title3">{title}</h2>
      <p className="max-w-[48rem] text-text-tertiary typo-callout">{note}</p>
    </div>
    {children}
  </section>
);

const Overview = (): ReactElement => (
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-12">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold uppercase text-text-tertiary typo-caption1">
          Mock · nothing in production changes
        </p>
        <h1 className="font-bold typo-title1">Signup aligned to the landing</h1>
        <p className="text-text-secondary typo-callout">
          The marketing landing&apos;s sign-up block is the source of truth: its
          copy, its background art and its three ways to sign up. Each surface
          keeps its own shell (logo, footer links, no new menus) and takes only
          that block and the art.
        </p>
      </header>

      <Row
        title="The truth: marketing landing"
        note="Also what mobile web and the PWA show. Nothing to change there; Google's One Tap sheet is Google's own UI and stays."
      >
        <div className="grid grid-cols-1 gap-6 laptop:grid-cols-[2fr_1fr]">
          <Column label="Landing · desktop" tone="truth">
            <Shot file="01-desktop-landing" />
          </Column>
          <Column label="Landing · phone, PWA" tone="truth">
            <Shot file="05-mobile-landing" phone />
          </Column>
        </div>
      </Row>

      <Row
        title="/onboarding and /onboarding?r=extension · desktop"
        note="Sign up from the landing header, and every sign-in the extension hands off, land here."
      >
        <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
          <Column label="Before" tone="before">
            <Shot file="03-desktop-signup" />
          </Column>
          <Column label="After" tone="after">
            <DesktopFrame
              storyId="login-surfaces-aligned-signup--desktop"
              title="Aligned desktop funnel"
              width={1440}
              height={900}
            />
          </Column>
        </div>
      </Row>

      <Row
        title="/onboarding?android=true · Android app"
        note="The Android app skips the landing and opens the funnel at phone width."
      >
        <div className="flex flex-wrap gap-6">
          <Column label="Before" tone="before">
            <Shot file="07-android-landing" phone />
          </Column>
          <Column label="After" tone="after">
            <PhoneFrame
              storyId="login-surfaces-aligned-signup--phone"
              title="Aligned phone funnel"
            />
          </Column>
        </div>
      </Row>

      <Row
        title="/onboarding?ios=true · iOS app"
        note="Captured from the real app on an iPhone 17 simulator. It also skips the landing. Apple stays in place of GitHub, which the App Store requires next to other social logins."
      >
        <div className="flex flex-wrap gap-6">
          <Column label="Before" tone="before">
            <Shot file="14-ios-first" phone />
          </Column>
          <Column label="After" tone="after">
            <PhoneFrame
              storyId="login-surfaces-aligned-signup--ios"
              title="Aligned iOS funnel"
            />
          </Column>
        </div>
      </Row>

      <Row title="What changes" note="Only the inner block and the art.">
        <ul className="flex max-w-[50rem] list-disc flex-col gap-2 pl-6 text-text-secondary typo-callout">
          <li>
            Headline: &quot;Where developers discover what’s next.&quot; with
            the period and curly apostrophe.
          </li>
          <li>
            Ways to sign up: white Google, then GitHub and email as filled dark
            buttons with their icons. No &quot;or&quot; divider.
          </li>
          <li>
            Legal line sits under the buttons, on desktop and phone. It leaves
            the footer row.
          </li>
          <li>
            &quot;Already have an account? Log in&quot; under the legal line.
          </li>
          <li>
            Background: the landing&apos;s boy-and-dog art replaces the desk
            photo and the illustrated room.
          </li>
          <li>Kept as is: the funnel&apos;s logo and footer links.</li>
          <li>
            iOS only: the native splash still shows the illustrated room. It is
            SplashImage in the iOS repo, so swapping it for the landing art
            ships with an app release.
          </li>
        </ul>
      </Row>
    </div>
  </div>
);

export const Comparison: StoryObj = {
  name: 'Overview',
  render: () => <Overview />,
};
