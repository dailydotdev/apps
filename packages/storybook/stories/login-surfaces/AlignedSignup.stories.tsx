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
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import { MemberAlready } from '@dailydotdev/shared/src/components/onboarding/MemberAlready';
import { MailIcon } from '@dailydotdev/shared/src/components/icons/Mail';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { FooterLinks } from '@dailydotdev/shared/src/components/footer/FooterLinks';
import { signupWallHorizon } from '@dailydotdev/shared/src/lib/image';
import { HERO_STYLES } from '@dailydotdev/shared/src/features/onboarding/components/signupHero/heroStyles';
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
// inner block are the landing's. The art takes daily.dev/'s hero settings:
// full width, cover at 47% 50%, clamp(760px, 46vw, 950px) tall from the top,
// fading out over its last 18%. The landing's dark halo sits behind its
// left-hand copy; here it is centered on the block and narrowed to keep the
// boy and Patchy clear.
const DesktopFunnel = (): ReactElement => (
  <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-background-default text-text-primary">
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
          WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent)',
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

export const Desktop: DeviceStory = {
  name: '/onboarding · desktop',
  globals: { theme: 'dark' },
  ...onDevice(devices.laptop, '03-desktop-signup', () => <DesktopFunnel />),
};

export const Phone: DeviceStory = {
  name: '/onboarding · phone',
  globals: { theme: 'dark' },
  ...onDevice(devices.pixel, '07-android-landing', () => <PhoneFunnel />),
};

export const IOS: DeviceStory = {
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
  name: 'iOS app · splash',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, '13-ios-splash', () => <IOSSplash />),
};

// The Android app's loading state, today an empty page with the logged-in
// bottom nav, showing the same art as the iOS splash.
export const AndroidLoading: DeviceStory = {
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
  name: 'Extension · /activate',
  globals: { theme: 'dark' },
  ...onDevice(devices.laptop, '10-extension-install', () => <ActivatePage />),
};

export const IOSTracking: DeviceStory = {
  name: 'iOS app · tracking prompt',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, '15-ios-tracking-prompt', () => (
    <IOSTrackingPrompt />
  )),
};
