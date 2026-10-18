import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  OnboardingActions,
  providerMap,
  type SocialProvider,
} from '@dailydotdev/shared/src/components/auth/common';
import {
  HijackingCoverStrip,
  hijackingPrimaryCta,
} from '@dailydotdev/shared/src/components/auth/HijackingCoverStrip';
import { onboardingGradientClasses } from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';

// The extension can't run social OAuth from its own origin (the API rejects it
// with a 403), so auth is handed off to the webapp onboarding flow, which runs
// on a trusted origin and auto-triggers the relevant auth screen.
const buildOnboardingHref = (action?: OnboardingActions): string => {
  const base = new URL(onboardingUrl);
  base.searchParams.append('r', 'extension');
  if (action) {
    base.searchParams.append('action', action);
  }

  return base.toString();
};

const onboardingHref = buildOnboardingHref();
const loginHref = buildOnboardingHref(OnboardingActions.Login);

const COPY = {
  heading: 'Unlock the full daily.dev experience',
  loggedOut: {
    body: 'Log in to pick up where you left off.',
    cta: 'Log in to continue',
  },
  onboarding: {
    body: 'You still have a few onboarding steps left. Finish them to unlock the full experience.',
    cta: 'Continue onboarding',
  },
} as const;

// Rendered invisibly to keep the strip at the height of the original cat
// strip, the height the cover design was tested and shipped at. It reads the
// same COPY, so a copy edit moves the height with it, as it did in the test.
function CoverStripSizer({
  isLoggedOut,
}: {
  isLoggedOut: boolean;
}): ReactElement {
  const copy = isLoggedOut ? COPY.loggedOut : COPY.onboarding;

  return (
    <>
      <div className="flex flex-1 flex-col items-center p-5 text-center tablet:items-start tablet:p-6 tablet:text-left">
        <div className="flex flex-col items-center gap-1 tablet:items-start">
          <h3 className="font-bold text-white typo-title2">{COPY.heading}</h3>
          <p className="text-white/80 text-sm">{copy.body}</p>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            className="mt-4 w-fit"
          >
            {copy.cta}
          </Button>
        </div>
      </div>
      <div className="bg-black/20 flex h-[12.5rem] w-full items-center justify-center p-2 tablet:h-auto tablet:w-[14.5rem] tablet:p-3 laptopL:w-[16rem]">
        <div className="w-full" style={{ aspectRatio: '1040 / 758' }} />
      </div>
    </>
  );
}

const coverCtaClassName = classNames(
  'shadow-2 shadow-black/40',
  hijackingPrimaryCta,
);

function CoverStrip({
  isLoggedOut,
  action,
}: {
  isLoggedOut: boolean;
  action: ReactNode;
}): ReactElement {
  const copy = isLoggedOut ? COPY.loggedOut : COPY.onboarding;

  return (
    <HijackingCoverStrip
      copy={{ heading: COPY.heading, body: copy.body }}
      actions={action}
      className={classNames('mb-4', feedStyles.cards)}
      sizer={<CoverStripSizer isLoggedOut={isLoggedOut} />}
    />
  );
}

function HijackingHeroStrip(): ReactElement {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { signBack, provider, isLoaded: isSignBackLoaded } = useSignBack();
  const hasLoggedImpression = useRef(false);

  const isLoggedOut = !user;
  const hasContinueAs = isLoggedOut && isSignBackLoaded && !!signBack?.name;
  const firstName = signBack?.name?.split(' ')[0] ?? signBack?.name;
  const socialProvider =
    provider && provider !== 'password'
      ? (provider as SocialProvider)
      : undefined;
  const providerIcon = socialProvider
    ? providerMap[socialProvider]?.icon
    : undefined;
  const isReadyToLogImpression = !isLoggedOut || isSignBackLoaded;

  const logClick = (targetType: TargetType): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: targetType,
      target_id: 'hijacking',
    });
  };

  useEffect(() => {
    if (!isReadyToLogImpression) {
      return;
    }

    if (hasLoggedImpression.current) {
      return;
    }
    hasLoggedImpression.current = true;

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.LoginButton,
      target_id: 'hijacking',
    });
  }, [isReadyToLogImpression, logEvent]);

  const onSignupClick = (): void => {
    logClick(TargetType.SignupButton);
    window.location.assign(onboardingHref);
  };

  const onLoginClick = (): void => {
    logClick(TargetType.LoginButton);
    window.location.assign(loginHref);
  };

  if (!isLoggedOut) {
    return (
      <CoverStrip
        isLoggedOut={false}
        action={
          <Button
            tag="a"
            href={onboardingHref}
            variant={ButtonVariant.Primary}
            className={coverCtaClassName}
            onClick={() => logClick(TargetType.LoginButton)}
          >
            {COPY.onboarding.cta}
          </Button>
        }
      />
    );
  }

  if (hasContinueAs && signBack) {
    return (
      <section className={classNames('mb-4 w-full pb-0', feedStyles.cards)}>
        <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
          <div className="top-hero-aurora pointer-events-none absolute inset-0" />
          <div className="dark relative z-1">
            <div className="flex flex-col items-center px-6 py-14 text-center tablet:py-16">
              <div className="relative">
                <ProfilePicture
                  user={signBack}
                  size={ProfileImageSize.XXXXLarge}
                  nativeLazyLoading
                  className="ring-white/20 ring-2"
                />
                {!!providerIcon && (
                  <span className="absolute -bottom-1.5 -right-1.5 flex size-8 items-center justify-center rounded-10 bg-white text-surface-invert shadow-2 ring-2 ring-raw-pepper-90">
                    {providerIcon}
                  </span>
                )}
              </div>
              <h2
                className={classNames(
                  'mt-6 text-balance typo-title1 tablet:typo-mega2',
                  onboardingGradientClasses,
                )}
              >
                Welcome back, {firstName}!
              </h2>
              {!!signBack?.email && (
                <p className="text-white/70 mt-2 typo-callout">
                  {signBack.email}
                </p>
              )}
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Large}
                className={classNames(
                  'mt-6 w-full max-w-80',
                  hijackingPrimaryCta,
                )}
                onClick={onLoginClick}
              >
                Continue as {firstName}&nbsp;➔
              </Button>
              <div className="text-white/60 mt-5 flex items-center gap-1.5 typo-footnote">
                Not you?
                <ClickableText
                  className="font-bold !text-white"
                  onClick={onLoginClick}
                >
                  Use another account
                </ClickableText>
              </div>
              <div className="text-white/60 mt-2 flex items-center gap-1.5 typo-footnote">
                New here?
                <ClickableText
                  className="font-bold !text-white"
                  onClick={onSignupClick}
                >
                  Create an account
                </ClickableText>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <CoverStrip
      isLoggedOut
      action={
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          className={coverCtaClassName}
          onClick={onLoginClick}
        >
          {COPY.loggedOut.cta}
        </Button>
      }
    />
  );
}

export default function HijackingLoginStrip(): ReactElement | null {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isLoading: isLayoutLoading } = useLayoutVariant();
  // MainFeedPage drops this slot on layout v2, but `isV2` reads false until
  // the layout resolves, so wait rather than flash the strip at v2 users.
  // Below laptop the layout hook never evaluates and `isLoading` stays true
  // for good, so only above it does that flag mean "still resolving".
  const isLayoutResolved = !isLaptop || !isLayoutLoading;

  if (!isLayoutResolved) {
    return null;
  }

  return <HijackingHeroStrip />;
}
