import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  AuthDisplay,
  type AuthOptionsProps,
  providerMap,
  type SocialProvider,
} from '@dailydotdev/shared/src/components/auth/common';
import { onboardingGradientClasses } from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
  cloudinaryReadingReminderCat,
} from '@dailydotdev/shared/src/lib/image';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';

type CoverVariant = 'continue' | 'signin' | 'onboarding';
type SigninHeroVariation = 'catStage' | 'onboardingSignup';

const signinHeroVariation: SigninHeroVariation = 'onboardingSignup';

const primaryCta =
  'transition-transform duration-200 ease-out hover:-translate-y-0.5';

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

function CatHeroImage(): ReactElement {
  return (
    <div className="relative w-full max-w-[26rem] tablet:max-w-[30rem]">
      <img
        src={cloudinaryReadingReminderCat}
        alt="Sleeping cat on laptop"
        className="relative z-1 w-full rounded-16 object-contain"
      />
    </div>
  );
}

interface SigninHeroProps {
  onSignupClick: () => void;
  onLoginClick: () => void;
  formRef: AuthOptionsProps['formRef'];
  onAuthStateUpdate: AuthOptionsProps['onAuthStateUpdate'];
}

type HeroActionButtonsProps = Pick<
  SigninHeroProps,
  'onSignupClick' | 'onLoginClick'
>;

function HeroActionButtons({
  onSignupClick,
  onLoginClick,
}: HeroActionButtonsProps): ReactElement {
  return (
    <div className="mt-8 flex w-full max-w-[23rem] flex-row gap-3 tablet:mx-0">
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        className={classNames('flex-1', primaryCta)}
        onClick={onSignupClick}
      >
        Sign up
      </Button>
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Large}
        className={classNames('flex-1', glassCta)}
        onClick={onLoginClick}
      >
        Log in
      </Button>
    </div>
  );
}

function CatStageHero({
  onSignupClick,
  onLoginClick,
}: SigninHeroProps): ReactElement {
  return (
    <section className={classNames('mb-4 w-full pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
        <div className="top-hero-stage pointer-events-none absolute inset-0" />
        <div className="top-hero-aurora opacity-70 pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />
        <div className="via-white/25 pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
        <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -bottom-8 left-1/2 h-32 w-[82%] -translate-x-1/2 rounded-[100%] blur-2xl" />
        <div className="via-accent-cabbage-default/80 pointer-events-none absolute bottom-0 left-1/2 h-px w-[86%] -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
        <div className="bg-accent-cabbage-default/12 pointer-events-none absolute -left-28 bottom-0 hidden h-72 w-72 rounded-full blur-3xl tablet:block" />
        <div className="bg-accent-onion-default/14 pointer-events-none absolute -right-28 top-4 hidden h-72 w-72 rounded-full blur-3xl tablet:block" />
        <div className="dark relative z-1 mx-auto grid min-h-[22rem] w-full max-w-[64rem] items-center gap-8 px-6 py-14 text-center tablet:min-h-[28rem] tablet:grid-cols-[minmax(0,1fr)_24rem] tablet:px-10 tablet:py-16 tablet:text-left">
          <div className="flex flex-col items-center tablet:items-start">
            <BrandLockup />
            <h2 className="mt-7 max-w-[42rem] text-balance font-bold text-white typo-title1 tablet:typo-mega2">
              Own your new tab. Make it your dev briefing.
            </h2>
            <div className="via-accent-cabbage-default/70 mt-5 h-px w-40 bg-gradient-to-r from-transparent to-transparent" />
            <p className="text-white/70 mt-4 max-w-[31rem] text-balance typo-callout tablet:typo-title3">
              Sign in and daily.dev will remember the topics, saves, upvotes,
              and discussions that matter to you.
            </p>
            <HeroActionButtons
              onSignupClick={onSignupClick}
              onLoginClick={onLoginClick}
            />
          </div>
          <div className="flex justify-center tablet:justify-end">
            <CatHeroImage />
          </div>
        </div>
      </div>
    </section>
  );
}

function OnboardingSignupHero({
  formRef,
  onAuthStateUpdate,
}: SigninHeroProps): ReactElement {
  return (
    <section className={classNames('mb-4 w-full pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
        <picture>
          <source
            media="(max-width: 655px)"
            srcSet={cloudinaryOnboardingFullBackgroundMobile}
          />
          <source
            media="(min-width: 656px)"
            srcSet={cloudinaryOnboardingFullBackgroundDesktop}
          />
          <img
            alt=""
            aria-hidden
            className="opacity-55 pointer-events-none absolute inset-0 size-full object-cover"
            role="presentation"
            src={cloudinaryOnboardingFullBackgroundDesktop}
          />
        </picture>
        <div className="bg-raw-pepper-90/55 pointer-events-none absolute inset-0" />
        <div className="via-raw-pepper-90/80 from-raw-pepper-90/60 pointer-events-none absolute inset-0 bg-gradient-to-b to-raw-pepper-90/40" />
        <div className="via-raw-pepper-90/70 pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="top-hero-aurora opacity-80 pointer-events-none absolute inset-0" />
        <div className="via-accent-cabbage-default/80 pointer-events-none absolute bottom-0 left-1/2 h-px w-[86%] -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
        <div className="dark relative z-1 mx-auto flex min-h-[22rem] w-full max-w-[48rem] flex-col items-center justify-center gap-8 px-6 py-14 text-center tablet:min-h-[28rem] tablet:px-10 tablet:py-16">
          <div className="flex flex-col items-center">
            <BrandLockup />
            <h2 className="mt-7 max-w-[42rem] text-balance font-bold text-white typo-title1 tablet:typo-mega2">
              Where developers make every tab count.
            </h2>
            <p className="text-white/75 mt-4 max-w-[31rem] text-balance typo-callout tablet:typo-title3">
              Sign in to turn daily.dev into your personalized feed, reputation,
              saves, and community in every new tab.
            </p>
          </div>
          <div className="border-white/10 w-full max-w-[23rem] rounded-24 border bg-white/[0.07] p-4 text-center shadow-2 backdrop-blur-md tablet:p-5">
            <p className="font-bold text-white typo-title3">
              Set up your developer feed
            </p>
            <p className="text-white/60 mt-2 typo-footnote">
              The same onboarding energy, compressed into one calm hero.
            </p>
            <AuthOptions
              ignoreMessages
              compact
              formRef={formRef}
              trigger={AuthTriggers.Onboarding}
              simplified
              defaultDisplay={AuthDisplay.OnboardingSignup}
              forceDefaultDisplay
              className={{
                container: 'mx-auto mt-5 !max-w-none !overflow-visible',
                onboardingSignup: '!gap-3',
              }}
              onAuthStateUpdate={onAuthStateUpdate}
              onboardingSignupButton={{
                variant: ButtonVariant.Primary,
                size: ButtonSize.Large,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const SigninHeroVariationMap = {
  catStage: CatStageHero,
  onboardingSignup: OnboardingSignupHero,
} satisfies Record<
  SigninHeroVariation,
  (props: SigninHeroProps) => ReactElement
>;

export default function HijackingLoginStrip(): ReactElement {
  const { showLogin, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { signBack, provider, isLoaded: isSignBackLoaded } = useSignBack();
  const hasLoggedImpression = useRef(false);
  const authFormRef = useRef<HTMLFormElement>(
    null,
  ) as unknown as AuthOptionsProps['formRef'];

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
  const isReadyToLogImpression = !isLoggedOut || isSignBackLoaded;

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
    if (!isReadyToLogImpression) {
      return;
    }

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
  }, [isReadyToLogImpression, variant, logEvent]);

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
  const onAuthStateUpdate: AuthOptionsProps['onAuthStateUpdate'] = (props) => {
    showLogin({
      trigger: AuthTriggers.Onboarding,
      options: {
        isLogin: !!props.isLoginFlow,
        defaultDisplay: props.defaultDisplay,
        formValues: props.email ? { email: props.email } : undefined,
      },
    });
  };
  const SigninHero = SigninHeroVariationMap[signinHeroVariation];

  const chrome = (children: ReactNode): ReactElement => (
    <section className={classNames('mb-4 w-full pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
        <div className="top-hero-aurora pointer-events-none absolute inset-0" />
        <div className="dark relative z-1">{children}</div>
      </div>
    </section>
  );

  if (variant === 'onboarding') {
    return chrome(
      <div className="flex flex-col items-center px-6 py-14 text-center tablet:py-16">
        <BrandLockup />
        <h2
          className={classNames(
            'mt-6 text-balance typo-title1 tablet:typo-mega2',
            onboardingGradientClasses,
          )}
        >
          Let&apos;s jump back in!
        </h2>
        <p className="text-white/70 mt-3 max-w-[24rem] text-balance typo-callout tablet:typo-title3">
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
      </div>,
    );
  }

  if (variant === 'continue' && signBack) {
    return chrome(
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
      </div>,
    );
  }

  return (
    <SigninHero
      onSignupClick={onSignupClick}
      onLoginClick={onLoginClick}
      formRef={authFormRef}
      onAuthStateUpdate={onAuthStateUpdate}
    />
  );
}
