import type { ReactElement, ReactNode } from 'react';
import React, { cloneElement, useEffect, useRef } from 'react';
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
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { FooterLinks } from '@dailydotdev/shared/src/components/footer/FooterLinks';
import { signupWallHorizon } from '@dailydotdev/shared/src/lib/image';
import {
  privacyPolicy,
  termsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import { HERO_STYLES } from '@dailydotdev/shared/src/features/onboarding/components/signupHero/heroStyles';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding/OnboardingHeader';
import { NewTabActivationPrimer } from '@dailydotdev/shared/src/features/onboarding/components/NewTabActivationPrimer';
import { ExtensionProviders, bootAsAnonymous } from '../extension/_providers';
import type { Device, DeviceStory } from './device';
import { DevicePair, devices, onDevice } from './device';
import { IOSTrackingAlert } from './iosSystem';

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

// The live landing's sign-up block at phone width (412px), measured: the
// phone mocks use these so type and spacing match it exactly.
const phoneHeadline = {
  fontSize: '2.1rem',
  lineHeight: '2.25rem',
  letterSpacing: '-0.0525rem',
};
const phoneButton = (isPrimary: boolean) => ({
  height: '3rem',
  borderRadius: '0.875rem',
  fontSize: '1.0625rem',
  lineHeight: '1.375rem',
  letterSpacing: '-0.010625rem',
  fontWeight: isPrimary ? 600 : 500,
});
const phoneLegal = { fontSize: '0.6875rem', lineHeight: '1rem' };

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
          'text-balance font-bold tracking-tight text-text-primary',
          align === 'center'
            ? 'text-center'
            : 'typo-large-title tablet:typo-mega3',
        )}
        style={align === 'center' ? phoneHeadline : undefined}
      >
        Where developers discover what’s next.
      </h1>
      <div className="mt-8 flex flex-col gap-4">
        {ways.map(({ label, icon, variant }) => (
          <Button
            key={label}
            className={classNames(
              'w-full',
              align !== 'center' && '!font-normal',
              variant === ButtonVariant.Float &&
                '!border !border-border-subtlest-tertiary !text-text-primary',
            )}
            icon={
              align === 'center'
                ? cloneElement(icon, { size: IconSize.Small })
                : icon
            }
            onClick={fn()}
            size={ButtonSize.Large}
            style={
              align === 'center'
                ? phoneButton(variant === ButtonVariant.Primary)
                : undefined
            }
            type="button"
            variant={variant}
          >
            {label}
          </Button>
        ))}
      </div>
      {align === 'center' ? (
        <p
          className="mt-4 w-full text-center text-text-tertiary"
          style={phoneLegal}
        >
          By continuing, you agree to the{' '}
          <a href={termsOfService} className="underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href={privacyPolicy} className="underline">
            Privacy Policy
          </a>
          .
        </p>
      ) : (
        <SignupDisclaimer className="mt-6 !text-text-tertiary typo-caption1" />
      )}
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
// Cloudflare's Turnstile check as production shows it under the password, in
// its dark theme and default 300x65 size. The widget only loads on a real
// daily.dev page, so the mock draws it; its colors are Cloudflare's, not ours.
const CloudflareCheck = (): ReactElement => (
  <div className="mx-auto" style={{ minHeight: '4.5rem' }}>
    <div
      aria-label="Cloudflare security check"
      className="flex items-center justify-between px-3"
      style={{
        width: '18.75rem',
        height: '4.0625rem',
        background: '#232323',
        border: '1px solid #797979',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="block size-7 rounded-4"
          style={{ background: '#111', border: '2px solid #8a8a8a' }}
        />
        <span style={{ color: '#d9d9d9', fontSize: '0.875rem' }}>
          Verify you are human
        </span>
      </div>
      <div className="flex flex-col items-end">
        <svg viewBox="0 0 64 28" className="h-5" aria-hidden>
          <path
            d="M50 26H10a8 8 0 0 1-1-15.9A12 12 0 0 1 31 6a10 10 0 0 1 18.6 4.4A8 8 0 0 1 50 26z"
            fill="#f6821f"
          />
          <path d="M44 26h12a6 6 0 0 0-6-9.5A7 7 0 0 0 44 26z" fill="#fbad41" />
        </svg>
        <span
          className="font-bold"
          style={{
            color: '#fff',
            fontSize: '0.5625rem',
            letterSpacing: '0.08em',
          }}
        >
          CLOUDFLARE
        </span>
        <span
          className="underline"
          style={{ color: '#bbb', fontSize: '0.5rem' }}
        >
          Privacy · Help
        </span>
      </div>
    </div>
  </div>
);

// The log in screen in the landing's style. It keeps everything log in does
// today: all four providers (accounts made with Apple or Facebook need them),
// email and password, forgot password and the way back to sign up. Only the
// type and buttons change, and unlike sign up it has no art. The bottom keeps
// production's layout: Cloudflare's check, then forgot password beside the
// log in button.
const LandingLoginBlock = ({
  align = 'left',
}: {
  align?: 'left' | 'center';
}): ReactElement => {
  const ways = [
    {
      provider: providerMap.google,
      icon: providerMap.google.icon,
      variant: ButtonVariant.Primary,
    },
    {
      provider: providerMap.github,
      icon: cloneElement(providerMap.github.icon, { secondary: true }),
      variant: ButtonVariant.Float,
    },
    {
      provider: providerMap.apple,
      icon: providerMap.apple.icon,
      variant: ButtonVariant.Float,
    },
    {
      provider: providerMap.facebook,
      icon: providerMap.facebook.icon,
      variant: ButtonVariant.Float,
    },
  ];

  return (
    <div className="flex w-full max-w-[26.25rem] flex-col">
      <h1
        className={classNames(
          'text-balance font-bold text-text-primary',
          align === 'center'
            ? 'text-center typo-title2'
            : 'tracking-tight typo-large-title tablet:typo-mega3',
        )}
      >
        Log in
      </h1>
      <div
        className={classNames(
          'flex flex-col gap-4',
          align === 'center' ? 'mt-6' : 'mt-8',
        )}
      >
        {ways.map(({ provider, icon, variant }) => (
          <Button
            key={provider.value}
            className={classNames(
              'w-full',
              align !== 'center' && '!font-normal',
              variant === ButtonVariant.Float &&
                '!border !border-border-subtlest-tertiary !text-text-primary',
            )}
            icon={
              align === 'center'
                ? cloneElement(icon, { size: IconSize.Small })
                : icon
            }
            onClick={fn()}
            size={ButtonSize.Large}
            style={
              align === 'center'
                ? phoneButton(variant === ButtonVariant.Primary)
                : undefined
            }
            type="button"
            variant={variant}
          >
            Continue with {provider.label}
          </Button>
        ))}
      </div>
      <div className="my-3 flex h-5 items-center gap-3 text-text-tertiary typo-footnote">
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
        or
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
      </div>
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <TextField
          leftIcon={
            <MailIcon role="presentation" aria-hidden size={IconSize.Small} />
          }
          inputId="login-email"
          name="identifier"
          label="Email"
          type="email"
          saveHintSpace
        />
        <PasswordField
          inputId="login-password"
          name="password"
          label="Password"
          showStrength={false}
          saveHintSpace
        />
        <CloudflareCheck />
        <div className="mt-4 flex w-full items-center">
          <button
            className="text-left text-text-tertiary underline typo-callout hover:text-text-primary"
            onClick={fn()}
            style={{ flex: 2 }}
            type="button"
          >
            Forgot password?
          </button>
          <Button
            size={ButtonSize.Medium}
            style={{ flex: 1 }}
            type="submit"
            variant={ButtonVariant.Primary}
          >
            Log in
          </Button>
        </div>
      </form>
      <p
        className="mt-8 border-t border-border-subtlest-tertiary text-center text-text-tertiary typo-callout"
        style={{ paddingTop: '1.875rem' }}
      >
        Not a member yet?{' '}
        <button
          className="text-text-primary underline"
          onClick={fn()}
          type="button"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

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
// inner block are the landing's. The art takes daily.dev/'s hero settings:
// full width, cover at 47% 50%, clamp(760px, 46vw, 950px) tall from the top,
// fading out over its last 18%. The landing's dark halo sits behind its
// left-hand copy; here it is centered on the block and narrowed to keep the
// boy and Patchy clear.
const DesktopFunnel = ({
  children,
  hasArt = true,
}: {
  children?: ReactNode;
  hasArt?: boolean;
}): ReactElement => (
  <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background-default text-text-primary">
    {hasArt && (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-1"
        style={{ height: 'clamp(47.5rem, 46vw, 59.375rem)' }}
      >
        <img
          alt=""
          className="block size-full select-none object-cover"
          src={signupWallHorizon}
          style={{
            objectPosition: '47% 50%',
            maskImage: 'linear-gradient(to bottom, black 82%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 82%, transparent)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(30% 78% at 50% 50%, rgba(15, 15, 18, 0.92), rgba(15, 15, 18, 0.62) 48%, rgba(0, 0, 0, 0) 78%)',
          }}
        />
      </div>
    )}
    <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-center gap-7 px-5 pb-16 pt-14">
      <Logo
        position={LogoPosition.Relative}
        className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
        logoClassName={{ container: 'h-7' }}
      />
      {children ?? <LandingSignupBlock />}
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
const PhoneFunnel = ({
  isIOS,
  children,
  hasArt = true,
}: {
  isIOS?: boolean;
  children?: ReactNode;
  hasArt?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background-default px-6 pb-8 text-text-primary',
      hasArt ? 'justify-end' : 'justify-start pt-6',
    )}
  >
    <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
    {hasArt && (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-1 h-1/2 overflow-hidden"
      >
        <LandingArt className="inset-0 size-full" focus="64% 50%" />
        <div className="onb-art-fade absolute inset-x-0 bottom-0 h-3/5" />
      </div>
    )}
    {hasArt ? (
      <div className="flex flex-col items-center gap-6">
        <Logo
          position={LogoPosition.Relative}
          className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
          logoClassName={{ container: 'h-6' }}
        />
        {children ?? <LandingSignupBlock align="center" isIOS={isIOS} />}
      </div>
    ) : (
      // Production's phone log in header: the logo mark alone, top left.
      <div className="flex flex-col gap-3">
        <LogoIcon className={{ container: 'h-logo self-start' }} />
        {children}
      </div>
    )}
  </div>
);

// Every aligned screen on one page, each at its device's real size with the
// production capture beside it. The single-screen stories below are what it
// embeds, so they stay out of the sidebar.
const screens: {
  title: string;
  note?: string;
  device: Device;
  before: string;
  storyId: string;
}[] = [
  {
    title: '/onboarding · desktop',
    note: 'Also the extension’s sign-up hand-off, /onboarding?r=extension.',
    device: devices.laptop,
    before: '03-desktop-signup',
    storyId: 'login-surfaces-aligned-signup--desktop',
  },
  {
    title: 'Log in · desktop',
    note: '/onboarding?action=login, also the extension’s log in. Every provider stays, so accounts made with Apple or Facebook can still get in.',
    device: devices.laptop,
    before: '17-desktop-login',
    storyId: 'login-surfaces-aligned-signup--desktop-login',
  },
  {
    title: '/onboarding · Android app',
    device: devices.pixel,
    before: '07-android-landing',
    storyId: 'login-surfaces-aligned-signup--phone',
  },
  {
    title: 'Log in · phone: mobile web, Android and iOS',
    note: 'The same web page in all three. iOS signs in natively when Google or Apple is tapped.',
    device: devices.pixel,
    before: '18-android-login',
    storyId: 'login-surfaces-aligned-signup--phone-login',
  },
  {
    title: '/onboarding · iOS app',
    note: 'Apple stays in GitHub’s place, as the App Store requires.',
    device: devices.iphone,
    before: '14-ios-first',
    storyId: 'login-surfaces-aligned-signup--ios',
  },
  {
    title: 'iOS app · splash',
    note: 'SplashImage in the iOS repo; ships with an app release.',
    device: devices.iphone,
    before: '13-ios-splash',
    storyId: 'login-surfaces-aligned-signup--ios-splash-screen',
  },
  {
    title: 'Android app · loading',
    device: devices.pixel,
    before: '07-android-landing-loading',
    storyId: 'login-surfaces-aligned-signup--android-loading',
  },
  {
    title: 'Extension · /activate',
    note: 'The real page playing the rebuilt Keep it demo.',
    device: devices.laptop,
    before: '10-extension-install',
    storyId: 'login-surfaces-aligned-signup--extension-activate',
  },
  {
    title: 'iOS app · tracking prompt',
    note: 'The chosen moment: right after the user answers "How did you hear about us?" in onboarding, not on launch over signup.',
    device: devices.iphone,
    before: '15-ios-tracking-prompt',
    storyId: 'login-surfaces-tracking-prompt-timing--after-acquisition',
  },
];

export const AllScreens: StoryObj = {
  name: 'All screens',
  render: () => (
    <div className="min-h-screen bg-background-subtle px-4 py-8 text-text-primary tablet:px-10">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-16">
        <header className="flex max-w-[48rem] flex-col gap-2">
          <p className="font-bold uppercase text-text-tertiary typo-caption1">
            Mock · before is production, after is aligned
          </p>
          <h1 className="font-bold typo-title1">Aligned signup</h1>
          <p className="text-text-secondary typo-callout">
            Every screen that changes, at its device&apos;s real size: the
            production capture next to the aligned version.
          </p>
        </header>
        {screens.map(({ title, note, device, before, storyId }) => (
          <section key={storyId + title} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-3">
              <h2 className="font-bold typo-title3">{title}</h2>
              {note && (
                <p className="text-text-tertiary typo-callout">{note}</p>
              )}
            </div>
            <DevicePair device={device} storyId={storyId} before={before} />
          </section>
        ))}
      </div>
    </div>
  ),
};

export const Desktop: DeviceStory = {
  tags: ['!dev'],
  name: '/onboarding · desktop',
  globals: { theme: 'dark' },
  ...onDevice(devices.laptop, '03-desktop-signup', () => <DesktopFunnel />),
};

export const Phone: DeviceStory = {
  tags: ['!dev'],
  name: '/onboarding · phone',
  globals: { theme: 'dark' },
  ...onDevice(devices.pixel, '07-android-landing', () => <PhoneFunnel />),
};

export const IOS: DeviceStory = {
  tags: ['!dev'],
  name: '/onboarding · iOS app',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, '14-ios-first', () => <PhoneFunnel isIOS />),
};

// The iOS app's native launch screen (SplashImage in the iOS repo), with new
// art in place of the illustrated room: the boy and Patchy on the glowing
// platform, recomposed for portrait at 1200x2310, the size of the current
// SplashImage, so it can replace it as is. The app icon stays.
const IOSSplash = (): ReactElement => (
  <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background-default">
    <img
      alt=""
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-1 size-full select-none object-cover"
      src="/images/login-surfaces/ios-splash-july-close.jpg"
      style={{ objectPosition: '50% 100%' }}
    />
    {/* The app's primary icon (`main` in the iOS repo), purple glow and all. */}
    <img
      alt="daily.dev"
      className="size-20 rounded-18 shadow-2"
      src="/images/login-surfaces/app-icon.png"
    />
  </div>
);

// Apple's App Tracking Transparency alert over the aligned funnel, where the
// app shows it today: on launch, before the user signs up.
const IOSTrackingPrompt = (): ReactElement => (
  <IOSTrackingAlert>
    <PhoneFunnel isIOS />
  </IOSTrackingAlert>
);

export const IOSSplashScreen: DeviceStory = {
  tags: ['!dev'],
  name: 'iOS app · splash',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, '13-ios-splash', () => <IOSSplash />),
};

// The Android app's loading state, today an empty page with the logged-in
// bottom nav, showing the same art as the iOS splash.
export const AndroidLoading: DeviceStory = {
  tags: ['!dev'],
  name: 'Android app · loading',
  globals: { theme: 'dark' },
  ...onDevice(devices.pixel, '07-android-landing-loading', () => <IOSSplash />),
};

// The extension's /activate page, line for line, playing the rebuilt "Keep
// it" demo: the same camera moves over the aligned page instead of the old
// room page. Production still loads the Cloudinary video; the primer has no
// way to take another source, so the story swaps it once it mounts.
const ACTIVATE_DEMO = '/images/login-surfaces/activate-keep-it.mp4';

const ActivatePage = (): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = ref.current?.querySelector('video');
    if (video && !video.src.endsWith(ACTIVATE_DEMO)) {
      video.src = ACTIVATE_DEMO;
      video.play().catch(() => undefined);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="z-3 flex min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden bg-background-default"
    >
      <OnboardingHeader />
      <NewTabActivationPrimer onComplete={fn()} />
    </div>
  );
};

export const ExtensionActivate: DeviceStory = {
  tags: ['!dev'],
  name: 'Extension · /activate',
  globals: { theme: 'dark' },
  ...onDevice(devices.laptop, '10-extension-install', () => <ActivatePage />),
};

export const DesktopLogin: DeviceStory = {
  tags: ['!dev'],
  name: 'Log in · desktop',
  globals: { theme: 'dark' },
  ...onDevice(devices.laptop, '17-desktop-login', () => (
    <DesktopFunnel hasArt={false}>
      <LandingLoginBlock />
    </DesktopFunnel>
  )),
};

export const PhoneLogin: DeviceStory = {
  tags: ['!dev'],
  name: 'Log in · phone',
  globals: { theme: 'dark' },
  ...onDevice(devices.pixel, '18-android-login', () => (
    <PhoneFunnel hasArt={false}>
      <LandingLoginBlock align="center" />
    </PhoneFunnel>
  )),
};

export const IOSTracking: DeviceStory = {
  tags: ['!dev'],
  name: 'iOS app · tracking prompt',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, '15-ios-tracking-prompt', () => (
    <IOSTrackingPrompt />
  )),
};
