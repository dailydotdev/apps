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
  providerMap,
  type SocialProvider,
} from '@dailydotdev/shared/src/components/auth/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';

type CoverVariant = 'continue' | 'signin' | 'onboarding';

function HeroChrome({ children }: { children: ReactNode }): ReactElement {
  return (
    <section className={classNames('mb-4 w-full px-4 pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
        <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
        <div className="top-hero-glow pointer-events-none absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2">
          <div className="flex flex-col items-center px-6 py-8 text-center tablet:py-10">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HijackingLoginStrip(): ReactElement {
  const { showLogin, user } = useAuthContext();
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

  const variant: CoverVariant = (() => {
    if (!isLoggedOut) {
      return 'onboarding';
    }

    return hasContinueAs ? 'continue' : 'signin';
  })();

  const onboardingHref = (() => {
    const base = new URL(onboardingUrl);
    base.searchParams.append('r', 'extension');

    return base.toString();
  })();

  const logClick = (targetType: TargetType): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: targetType,
      target_id: 'hijacking',
    });
  };

  useEffect(() => {
    if (hasLoggedImpression.current) {
      return;
    }
    hasLoggedImpression.current = true;

    logEvent({
      event_name: LogEvent.Impression,
      target_type:
        variant === 'signin' ? TargetType.SignupButton : TargetType.LoginButton,
      target_id: 'hijacking',
    });
  }, [variant, logEvent]);

  const onSignupClick = (): void => {
    logClick(TargetType.SignupButton);
    showLogin({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: false },
    });
  };

  const onLoginClick = (): void => {
    logClick(TargetType.LoginButton);
    showLogin({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: true },
    });
  };

  if (variant === 'onboarding') {
    return (
      <HeroChrome>
        <h2 className="font-bold text-white typo-title2 tablet:typo-title1">
          You&apos;re almost set
        </h2>
        <p className="text-white/70 mt-2 max-w-[26rem] text-balance typo-callout tablet:typo-body">
          Finish onboarding to unlock your personalized feed.
        </p>
        <Button
          tag="a"
          href={onboardingHref}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="mt-5"
          onClick={() => logClick(TargetType.LoginButton)}
        >
          Continue onboarding
        </Button>
      </HeroChrome>
    );
  }

  if (variant === 'continue' && signBack) {
    return (
      <HeroChrome>
        <h2 className="font-bold text-white typo-title2 tablet:typo-title1">
          Welcome back!
        </h2>
        <p className="text-white/70 mt-2 typo-callout">
          Let&apos;s pick up right where you left off.
        </p>
        <div className="relative mt-5">
          <ProfilePicture
            user={signBack}
            size={ProfileImageSize.XXXXLarge}
            nativeLazyLoading
          />
          {!!providerIcon && (
            <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-8 bg-white text-surface-invert shadow-2">
              {providerIcon}
            </span>
          )}
        </div>
        {!!signBack?.email && (
          <span className="mt-3 font-bold text-white typo-callout">
            {signBack.email}
          </span>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="mt-5 w-full max-w-80"
          onClick={onLoginClick}
        >
          Continue as {firstName}
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
      </HeroChrome>
    );
  }

  return (
    <HeroChrome>
      <span className="bg-white/10 flex size-16 items-center justify-center rounded-full text-white">
        <LogoIcon className={{ container: 'h-8 w-auto' }} />
      </span>
      <h2 className="mt-4 font-bold text-white typo-title2 tablet:typo-title1">
        Let&apos;s sign you in
      </h2>
      <p className="text-white/70 mt-2 max-w-[28rem] text-balance typo-callout tablet:typo-body">
        Sign in to start using daily.dev — keep your personalized feed, streak,
        and reputation in sync wherever you open a new tab.
      </p>
      <div className="mt-6 flex w-full max-w-80 flex-col gap-3">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="w-full"
          onClick={onSignupClick}
        >
          Sign up
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Large}
          className="w-full"
          onClick={onLoginClick}
        >
          Log in
        </Button>
      </div>
    </HeroChrome>
  );
}
