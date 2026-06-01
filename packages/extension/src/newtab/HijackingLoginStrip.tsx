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

const accentText =
  'bg-gradient-to-r from-accent-cabbage-bolder to-accent-onion-default bg-clip-text text-transparent';

const primaryCta =
  'shadow-2-cabbage transition-transform duration-200 ease-out hover:-translate-y-0.5';

const glassCta =
  '!border-white/20 !bg-white/[0.06] !text-white backdrop-blur-sm transition-colors duration-200 hover:!bg-white/[0.12]';

function BrandEyebrow(): ReactElement {
  return (
    <span className="border-white/10 bg-white/5 text-white/80 mb-4 inline-flex items-center gap-2 rounded-10 border px-3 py-1 font-bold uppercase tracking-wider backdrop-blur-sm typo-caption2">
      <span className="relative flex size-2">
        <span className="bg-accent-cabbage-default/70 absolute inline-flex size-full animate-ping rounded-full" />
        <span className="relative inline-flex size-2 rounded-full bg-accent-cabbage-default" />
      </span>
      daily.dev
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
        <div className="ring-white/10 relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2 ring-1 ring-inset">
          <div className="from-accent-cabbage-default/20 to-accent-onion-default/25 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />
          <div className="bg-accent-cabbage-default/30 pointer-events-none absolute -left-24 -top-28 size-72 rounded-full blur-3xl" />
          <div className="bg-accent-onion-default/30 pointer-events-none absolute -bottom-28 -right-20 size-72 rounded-full blur-3xl" />
          <div className="top-hero-dots pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="dark relative flex flex-col items-center px-6 py-10 text-center tablet:py-12">
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
        <h2 className="text-balance font-bold text-white typo-title1 tablet:typo-mega3">
          You&apos;re <span className={accentText}>almost&nbsp;set</span>
        </h2>
        <p className="text-white/70 mt-3 max-w-[28rem] text-balance typo-callout tablet:typo-title3">
          Finish onboarding to unlock your personalized feed.
        </p>
        <Button
          tag="a"
          href={onboardingHref}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className={classNames('mt-6', primaryCta)}
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
        <BrandEyebrow />
        <h2 className="text-balance font-bold text-white typo-title1 tablet:typo-mega3">
          Welcome <span className={accentText}>back!</span>
        </h2>
        <p className="text-white/70 mt-3 typo-callout tablet:typo-title3">
          Let&apos;s pick up right where you left off.
        </p>
        <div className="relative mt-7">
          <div
            aria-hidden
            className="bg-accent-cabbage-default/25 absolute -inset-3 rounded-full blur-2xl"
          />
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
        </div>
        {!!signBack?.email && (
          <span className="mt-4 font-bold text-white typo-callout">
            {signBack.email}
          </span>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className={classNames('mt-5 w-full max-w-80', primaryCta)}
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
      <BrandEyebrow />
      <span className="relative flex size-16 items-center justify-center">
        <span
          aria-hidden
          className="bg-accent-cabbage-default/25 absolute -inset-2 rounded-full blur-2xl"
        />
        <span className="from-accent-cabbage-default/30 to-accent-onion-default/30 ring-white/20 rounded-2xl relative flex size-16 items-center justify-center bg-gradient-to-br ring-1 ring-inset">
          <LogoIcon className={{ container: 'h-7 w-auto' }} />
        </span>
      </span>
      <h2 className="mt-5 text-balance font-bold text-white typo-title1 tablet:typo-mega3">
        Let&apos;s sign you <span className={accentText}>in</span>
      </h2>
      <p className="text-white/70 mt-3 max-w-[30rem] text-balance typo-callout tablet:typo-title3">
        Keep your personalized feed, streak, and reputation in sync wherever you
        open a new tab.
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
