import type { ReactElement } from 'react';
import React, { cloneElement, useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { providerMap } from '@dailydotdev/shared/src/components/auth/common';
import { MemberAlready } from '@dailydotdev/shared/src/components/onboarding/MemberAlready';
import { MailIcon } from '@dailydotdev/shared/src/components/icons/Mail';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { FooterLinks } from '@dailydotdev/shared/src/components/footer/FooterLinks';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { signupWallHorizon } from '@dailydotdev/shared/src/lib/image';
import {
  privacyPolicy,
  termsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding/OnboardingHeader';
import { NewTabActivationPrimer } from '@dailydotdev/shared/src/features/onboarding/components/NewTabActivationPrimer';
import { ExtensionProviders, bootAsAnonymous } from '../extension/_providers';
import type { DeviceStory } from './device';
import { devices, onDevice } from './device';
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

// The live landing's sign-up block, measured at 1440px and 412px: the mocks
// use these so type and spacing match it exactly. The headline is the only
// part that differs by width.
const desktopHeadline = {
  fontSize: 'clamp(2.25rem, 3.1vw, 2.75rem)',
  lineHeight: 1.14,
  letterSpacing: '-0.025em',
  filter: 'drop-shadow(0 0.125rem 1rem rgba(0, 0, 0, 0.5))',
};
const phoneHeadline = {
  fontSize: '2.1rem',
  lineHeight: '2.25rem',
  letterSpacing: '-0.0525rem',
};
const landingLegal = { fontSize: '0.6875rem', lineHeight: '1rem' };
const landingButton = (isPrimary: boolean) => ({
  height: '3rem',
  borderRadius: '0.875rem',
  fontSize: '1.0625rem',
  lineHeight: '1.375rem',
  letterSpacing: '-0.010625rem',
  fontWeight: isPrimary ? 600 : 500,
});

// The landing's typeface. The mocks load it themselves since the app does not
// ship it.
const landingFont = { fontFamily: '"Plus Jakarta Sans", sans-serif' };
const LandingFont = (): ReactElement => (
  <link
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
);

// Who an invite link (/join) came from: production's ReferralInviterCard
// without its frame and background, with a smaller avatar. It reads the
// inviter from the URL and the API, so the mock uses a fixed inviter.
const inviter = {
  id: '28849d86070e4c099c877ab6837c61f0',
  name: 'Ido Shamun',
  username: 'idoshamun',
  image:
    'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0',
};

const InviterCard = ({ className }: { className?: string }): ReactElement => (
  <figure
    className={classNames(
      'flex max-w-[22.5rem] items-center gap-2 text-left',
      className,
    )}
  >
    <ProfilePicture
      user={inviter}
      size={ProfileImageSize.Medium}
      eager
      className="shrink-0"
    />
    <p className="min-w-0 flex-1 truncate typo-callout">
      <strong>{inviter.name}</strong>
      <span className="text-text-secondary"> invited you</span>
    </p>
  </figure>
);

// The marketing landing's sign-up block, the source of truth: headline, the
// three ways to sign up and the log in link. The legal line under the
// buttons shows on the web only, not in the apps. An invite link adds who
// sent it above the headline. On iOS, Apple takes GitHub's place: the App
// Store requires Sign in with Apple next to other social logins, and the app
// already offers it.
const LandingSignupBlock = ({
  align = 'left',
  isIOS = false,
  isWeb = align === 'left',
  isInvite = false,
}: {
  align?: 'left' | 'center';
  isIOS?: boolean;
  isWeb?: boolean;
  isInvite?: boolean;
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
    <div className="flex w-full max-w-[28.75rem] flex-col" style={landingFont}>
      {isInvite && (
        <InviterCard
          className={classNames('mb-6', align === 'center' && 'self-center')}
        />
      )}
      <h1
        className={classNames(
          'text-balance font-bold text-text-primary',
          align === 'center' && 'text-center',
        )}
        style={align === 'center' ? phoneHeadline : desktopHeadline}
      >
        Where developers discover what’s next.
      </h1>
      <div className="flex w-full max-w-[26.25rem] flex-col">
        <div className="mt-8 flex flex-col gap-4">
          {ways.map(({ label, icon, variant }) => (
            <Button
              key={label}
              className={classNames(
                'w-full',
                variant === ButtonVariant.Float &&
                  '!border !border-border-subtlest-tertiary !text-text-primary',
              )}
              icon={cloneElement(icon, { size: IconSize.Small })}
              onClick={fn()}
              size={ButtonSize.Large}
              style={landingButton(variant === ButtonVariant.Primary)}
              type="button"
              variant={variant}
            >
              {label}
            </Button>
          ))}
        </div>
        {isWeb && (
          <p
            className="mt-4 w-full text-center text-text-tertiary"
            style={landingLegal}
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
    </div>
  );
};

// `/onboarding` at laptop width, which also serves the extension's hand-off,
// laid out as daily.dev/'s hero: the landing's header with only log in and
// sign up, the art full width (cover at 47% 50%, clamp(760px, 46vw, 950px)
// tall, fading out over its last 18%), the dark halo behind the copy, and the
// block on the left of the same 1280px container. The funnel's footer links
// row stays at the bottom right.
const DesktopFunnel = ({ isInvite }: { isInvite?: boolean }): ReactElement => (
  <div
    className="relative isolate min-h-dvh w-full overflow-hidden bg-background-default text-text-primary"
    style={landingFont}
  >
    <LandingFont />
    <header className="absolute inset-x-0 top-0 z-2">
      <nav className="mx-auto flex h-16 max-w-[80rem] items-center justify-between px-8">
        <Logo
          position={LogoPosition.Relative}
          className="!left-0 !top-0 !mt-0 !translate-x-0"
          logoClassName={{ container: 'h-5' }}
        />
        <div className="flex items-center gap-4">
          <button
            className="text-sm font-semibold text-text-secondary hover:text-text-primary"
            onClick={fn()}
            type="button"
          >
            Log in
          </button>
          <button
            className="flex items-center gap-1 rounded-14 bg-text-primary px-4 py-2 text-xs font-semibold text-surface-invert"
            onClick={fn()}
            type="button"
          >
            Sign up
            <span aria-hidden>→</span>
          </button>
        </div>
      </nav>
    </header>
    <div className="relative">
      <img
        alt=""
        aria-hidden
        className="block w-full select-none object-cover"
        src={signupWallHorizon}
        style={{
          height: 'clamp(47.5rem, 46vw, 59.375rem)',
          objectPosition: '47% 50%',
          maskImage: 'linear-gradient(to bottom, black 82%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-1"
        style={{
          background:
            'radial-gradient(46% 78% at 33% 50%, rgba(15, 15, 18, 0.92), rgba(15, 15, 18, 0.62) 48%, transparent 78%)',
          filter: 'blur(1.25rem)',
        }}
      />
      <div className="absolute inset-0 z-2">
        <div className="mx-auto flex h-full max-w-[80rem] flex-col justify-center px-8 pt-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-start">
            <LandingSignupBlock isInvite={isInvite} />
          </div>
        </div>
      </div>
    </div>
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-3 flex justify-end px-6 pb-4">
      <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-end">
        <FooterLinks />
      </div>
    </div>
  </div>
);

// The Android and iOS apps at phone width: the art across the top fading
// into the page, the logo, then the landing block anchored to the bottom.
// The art sits 14% higher than its band so the boy and Patchy clear the
// fade, and it fades out on its own over its last 30%.
const PhoneFunnel = ({
  isIOS,
  isWeb,
  isInvite,
}: {
  isIOS?: boolean;
  isWeb?: boolean;
  isInvite?: boolean;
}): ReactElement => (
  <div className="relative isolate flex min-h-dvh w-full flex-col justify-end overflow-hidden bg-background-default px-6 pb-8 text-text-primary">
    <LandingFont />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-1 h-1/2 overflow-hidden"
    >
      <img
        alt=""
        className="absolute inset-x-0 size-full select-none object-cover"
        src={signupWallHorizon}
        style={{
          top: '-14%',
          objectPosition: '64% 50%',
          maskImage: 'linear-gradient(to bottom, black 70%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent)',
        }}
      />
    </div>
    <div className="flex flex-col items-center gap-6">
      <Logo
        position={LogoPosition.Relative}
        className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
        logoClassName={{ container: 'h-6' }}
      />
      <LandingSignupBlock
        align="center"
        isIOS={isIOS}
        isWeb={isWeb}
        isInvite={isInvite}
      />
    </div>
  </div>
);

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

export const DesktopInvite: DeviceStory = {
  tags: ['!dev'],
  name: 'Invite link · desktop',
  globals: { theme: 'dark' },
  ...onDevice(devices.laptop, '24-invite-desktop', () => (
    <DesktopFunnel isInvite />
  )),
};

export const PhoneInvite: DeviceStory = {
  tags: ['!dev'],
  name: 'Invite link · mobile web',
  globals: { theme: 'dark' },
  ...onDevice(devices.pixel, '25-invite-pixel', () => (
    <PhoneFunnel isWeb isInvite />
  )),
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

export const IOSTracking: DeviceStory = {
  tags: ['!dev'],
  name: 'iOS app · tracking prompt',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, '15-ios-tracking-prompt', () => (
    <IOSTrackingPrompt />
  )),
};
