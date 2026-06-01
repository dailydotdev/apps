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
import { onboardingGradientClasses } from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { cloudinaryOnboardingGlow } from '@dailydotdev/shared/src/lib/image';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';

type CoverVariant = 'continue' | 'signin' | 'onboarding';

const primaryCta =
  'shadow-2-cabbage transition-transform duration-200 ease-out hover:-translate-y-0.5';

const glassCta =
  '!border-white/20 !bg-white/[0.06] !text-white backdrop-blur-sm transition-colors duration-200 hover:!bg-white/[0.12]';

function BrandLockup(): ReactElement {
  return (
    <span className="flex items-center gap-2 text-white">
      <LogoIcon className={{ container: 'h-7 w-auto' }} />
      <LogoText className={{ container: 'h-6 w-auto' }} />
    </span>
  );
}

function HeroChrome({ children }: { children: ReactNode }): ReactElement {
  return (
    <section className={classNames('mb-4 w-full px-4 pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
        <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
        <div className="pointer-events-none absolute bottom-0 left-0 z-2 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 z-2 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2">
          <img
            src={cloudinaryOnboardingGlow}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 mx-auto w-[33rem] max-w-full"
          />
          <div className="dark relative z-1 flex flex-col items-center px-6 py-12 text-center tablet:py-14">
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
        <BrandLockup />
        <h2
          className={classNames(
            'mt-6 text-balance typo-title1 tablet:typo-mega2',
            onboardingGradientClasses,
          )}
        >
          Let&apos;s jump back in!
        </h2>
        <p className="text-white/70 mt-3 max-w-[26rem] text-balance typo-callout tablet:typo-title3">
          Finish onboarding to unlock the full daily.dev experience.
        </p>
        <Button
          tag="a"
          href={onboardingHref}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className={classNames('mt-7', primaryCta)}
          onClick={() => logClick(TargetType.LoginButton)}
        >
          Continue&nbsp;➔
        </Button>
      </HeroChrome>
    );
  }

  if (variant === 'continue' && signBack) {
    return (
      <HeroChrome>
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
          <p className="text-white/70 mt-2 typo-callout">{signBack.email}</p>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className={classNames('mt-6 w-full max-w-80', primaryCta)}
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
      </HeroChrome>
    );
  }

  return (
    <HeroChrome>
      <BrandLockup />
      <h2
        className={classNames(
          'mt-6 text-balance typo-title1 tablet:typo-mega2',
          onboardingGradientClasses,
        )}
      >
        Your feed is one tap away
      </h2>
      <p className="text-white/70 mt-3 max-w-[28rem] text-balance typo-callout tablet:typo-title3">
        Sign in to keep the dev news, tools, and discussions that matter synced
        across every new tab.
      </p>
      <div className="mt-7 flex w-full max-w-80 flex-col gap-3">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className={classNames('w-full', primaryCta)}
          onClick={onSignupClick}
        >
          Sign up
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Large}
          className={classNames('w-full', glassCta)}
          onClick={onLoginClick}
        >
          Log in
        </Button>
      </div>
    </HeroChrome>
  );
}
