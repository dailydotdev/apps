import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import AuthOptions from './AuthOptions';
import SignupDisclaimer from './SignupDisclaimer';
import { MemberAlready } from '../onboarding/MemberAlready';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import {
  AuthDisplay,
  type AuthOptionsProps,
  OnboardingActions,
  providerMap,
  type SocialProvider,
} from './common';
import { onboardingGradientClasses } from '../onboarding/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useConditionalFeature } from '../../hooks';
import { useSignBack } from '../../hooks/auth/useSignBack';
import { AuthTriggers } from '../../lib/auth';
import { onboardingUrl } from '../../lib/constants';
import {
  cloudinaryHijackingCoverArt,
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
  cloudinaryReadingReminderCat,
} from '../../lib/image';
import {
  featureHijackingVariants,
  HijackingVariant,
} from '../../lib/featureManagement';
import { LogEvent, TargetType } from '../../lib/log';
import feedStyles from '../Feed.module.css';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';

type CoverVariant = 'continue' | 'signin' | 'onboarding';

const primaryCta =
  'transition-transform duration-200 ease-out hover:-translate-y-0.5';

const glassCta =
  '!border-white/20 !bg-white/[0.06] !text-white backdrop-blur-sm transition-colors duration-200 hover:!bg-white/[0.12]';

const LIVE_COPY = {
  heading: 'Own your new tab. Make it your dev briefing.',
  body: 'Sign in and daily.dev remembers the topics, saves, and discussions that matter to you.',
  signup: 'Sign up',
  login: 'Log in',
} as const;

export type HijackingCopy = { heading: string; body: string };

// The extension can't run social OAuth from its own origin (the API rejects it
// with a 403). The CTA arm hands auth off to the webapp onboarding flow, which
// runs on a trusted origin and auto-triggers the relevant auth screen.
const buildOnboardingHref = (action?: OnboardingActions): string => {
  // String-built: the webapp's `onboardingUrl` is a bare path.
  const params = new URLSearchParams({ r: 'extension' });
  if (action) {
    params.append('action', action);
  }

  return `${onboardingUrl}?${params.toString()}`;
};

const onboardingHref = buildOnboardingHref();
const loginHref = buildOnboardingHref(OnboardingActions.Login);

function BrandLockup(): ReactElement {
  return (
    <span className="flex items-center gap-2 text-white">
      <LogoIcon className={{ container: 'h-7 w-auto' }} />
      <LogoText className={{ container: 'h-6 w-auto' }} />
    </span>
  );
}

interface SigninHeroProps {
  onSignupClick: () => void;
  onLoginClick: () => void;
  isLoggedOut: boolean;
  copy: HijackingCopy;
  className?: string;
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
    <div className="mt-4 flex w-full max-w-[18.4rem] flex-row gap-2.5 tablet:mx-0">
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className={classNames('flex-1', primaryCta)}
        onClick={onSignupClick}
      >
        {LIVE_COPY.signup}
      </Button>
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Medium}
        className={classNames('flex-1', glassCta)}
        onClick={onLoginClick}
      >
        {LIVE_COPY.login}
      </Button>
    </div>
  );
}

const CONTROL_COPY = {
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

// Rendered invisibly by the cover arms to reserve the control's exact height,
// so editing the control cannot silently break the experiment's height parity.
function ControlTextColumn({
  isLoggedOut,
  action,
}: {
  isLoggedOut: boolean;
  action?: ReactNode;
}): ReactElement {
  const copy = isLoggedOut ? CONTROL_COPY.loggedOut : CONTROL_COPY.onboarding;

  return (
    <div className="flex flex-1 flex-col items-center p-5 text-center tablet:items-start tablet:p-6 tablet:text-left">
      <div className="flex flex-col items-center gap-1 tablet:items-start">
        <h3 className="font-bold text-white typo-title2">
          {CONTROL_COPY.heading}
        </h3>
        <p className="text-white/80 text-sm">{copy.body}</p>
        {action ?? (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            className="mt-4 w-fit"
          >
            {copy.cta}
          </Button>
        )}
      </div>
    </div>
  );
}

function ControlMediaPanel({
  children,
}: {
  children?: ReactNode;
}): ReactElement {
  return (
    <div className="bg-black/20 flex h-[12.5rem] w-full items-center justify-center p-2 tablet:h-auto tablet:w-[14.5rem] tablet:p-3 laptopL:w-[16rem]">
      {children ?? (
        <div className="w-full" style={{ aspectRatio: '1040 / 758' }} />
      )}
    </div>
  );
}

// Height-matched to DefaultHijackingStrip so the header-ad-impression
// experiment can isolate design from banner height: this arm keeps its own
// visual language (glowing "stage" backdrop, dual CTAs, its own copy) but
// mirrors the control's compact layout — same padding (p-5/tablet:p-6), same
// image sizing, and no forced min-height/py — so both arms occupy the same
// vertical space.
function CatStageHero({
  onSignupClick,
  onLoginClick,
  copy,
  className,
}: SigninHeroProps): ReactElement {
  return (
    <section className={classNames('w-full pb-0', feedStyles.cards, className)}>
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
        <div className="top-hero-stage pointer-events-none absolute inset-0" />
        <div className="top-hero-aurora opacity-70 pointer-events-none absolute inset-0" />
        <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -bottom-8 left-1/2 h-32 w-[82%] -translate-x-1/2 rounded-[100%] blur-2xl" />
        <div className="via-accent-cabbage-default/80 pointer-events-none absolute bottom-0 left-1/2 h-px w-[86%] -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
        <div className="dark relative z-1 flex flex-col tablet:flex-row tablet:items-stretch">
          <div className="flex flex-1 flex-col items-center p-5 text-center tablet:items-start tablet:p-6 tablet:text-left">
            <div className="flex flex-col items-center gap-1 tablet:items-start">
              <h3 className="font-bold text-white typo-title2">
                {copy.heading}
              </h3>
              <p className="text-white/70 text-sm">{copy.body}</p>
              <HeroActionButtons
                onSignupClick={onSignupClick}
                onLoginClick={onLoginClick}
              />
            </div>
          </div>
          <div className="bg-black/20 flex h-[12.5rem] w-full items-center justify-center p-2 tablet:h-auto tablet:w-[14.5rem] tablet:p-3 laptopL:w-[16rem]">
            <img
              src={cloudinaryReadingReminderCat}
              alt="Sleeping cat on laptop"
              className="m-0 h-full w-full max-w-none scale-105 object-contain laptopL:scale-110"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function OnboardingSignupHero({
  formRef,
  onAuthStateUpdate,
  onLoginClick,
  className,
}: SigninHeroProps): ReactElement {
  return (
    <section className={classNames('w-full pb-0', feedStyles.cards, className)}>
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
        <div className="dark relative z-1 mx-auto flex min-h-[20rem] w-full max-w-[48rem] flex-col items-center justify-center px-6 py-10 text-center tablet:min-h-[24rem] tablet:px-10 tablet:py-12">
          <div className="w-full max-w-[25rem] rounded-24 border border-border-subtlest-tertiary bg-white/[0.045] p-5 text-center backdrop-blur-md tablet:p-6">
            <h2 className="mx-auto max-w-[22rem] text-balance font-bold text-white typo-title2 tablet:typo-title1">
              Where developers make every tab count.
            </h2>
            <AuthOptions
              ignoreMessages
              compact
              hideLoginLink
              formRef={formRef}
              trigger={AuthTriggers.Onboarding}
              simplified
              defaultDisplay={AuthDisplay.OnboardingSignup}
              forceDefaultDisplay
              className={{
                container: 'mx-auto mt-6 !max-w-none !overflow-visible',
                onboardingSignup: '!gap-3',
              }}
              onAuthStateUpdate={onAuthStateUpdate}
              onboardingSignupButton={{
                variant: ButtonVariant.Primary,
                size: ButtonSize.Large,
              }}
            />
            <SignupDisclaimer className="!text-text-tertiary tablet:!typo-footnote" />
            <MemberAlready
              onLogin={onLoginClick}
              className={{
                container:
                  'mx-auto mt-6 justify-center text-text-secondary typo-callout',
                login: '!text-inherit',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const coverArtPosition = { objectPosition: '50% 62%' };

function CoverSignupHero({
  onSignupClick,
  onLoginClick,
  isLoggedOut,
  copy,
  className,
}: SigninHeroProps): ReactElement {
  return (
    <section className={classNames('w-full pb-0', feedStyles.cards, className)}>
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
        <img
          src={cloudinaryHijackingCoverArt}
          alt=""
          aria-hidden
          role="presentation"
          className="pointer-events-none absolute inset-0 size-full object-cover"
          style={coverArtPosition}
        />
        <div className="cover-hero-dome pointer-events-none absolute inset-0" />
        <div className="from-raw-pepper-90/70 pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent" />
        <div
          aria-hidden
          className="invisible hidden tablet:flex tablet:flex-row tablet:items-stretch"
        >
          <ControlTextColumn isLoggedOut={isLoggedOut} />
          <ControlMediaPanel />
        </div>
        <div className="dark relative z-1 flex flex-col items-center justify-center p-5 text-center tablet:absolute tablet:inset-0">
          <h3 className="font-bold text-white typo-title2 [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
            {copy.heading}
          </h3>
          <p className="text-white/80 mt-1 max-w-[34rem] text-balance text-sm [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            {copy.body}
          </p>
          <div className="mt-4 flex flex-row justify-center gap-2.5">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className={classNames(
                'group/cta shadow-2 shadow-black/40',
                primaryCta,
              )}
              onClick={onSignupClick}
            >
              {LIVE_COPY.signup}
              <span className="ml-1 inline-block transition-transform duration-200 group-hover/cta:translate-x-0.5">
                →
              </span>
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Medium}
              className={glassCta}
              onClick={onLoginClick}
            >
              {LIVE_COPY.login}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const SigninHeroMap = {
  [HijackingVariant.CTA]: CatStageHero,
  [HijackingVariant.Auth]: OnboardingSignupHero,
  [HijackingVariant.Cover]: CoverSignupHero,
} satisfies Record<
  Exclude<HijackingVariant, HijackingVariant.Default>,
  (props: SigninHeroProps) => ReactElement
>;

function DefaultHijackingStrip({
  className,
}: {
  className?: string;
}): ReactElement {
  const { showLogin, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isLoggedOut = !user;

  const logHijackingClick = (): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.LoginButton,
      target_id: 'hijacking',
    });
  };

  return (
    <section
      className={classNames('w-full px-4 pb-0', feedStyles.cards, className)}
    >
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
        <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
        <div className="top-hero-glow pointer-events-none absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2">
          <div className="flex flex-col tablet:flex-row tablet:items-stretch">
            <ControlTextColumn
              isLoggedOut={isLoggedOut}
              action={
                isLoggedOut ? (
                  <Button
                    type="button"
                    variant={ButtonVariant.Primary}
                    className="mt-4 w-fit"
                    onClick={() => {
                      logHijackingClick();

                      showLogin({
                        trigger: AuthTriggers.Onboarding,
                        options: { isLogin: true },
                      });
                    }}
                  >
                    {CONTROL_COPY.loggedOut.cta}
                  </Button>
                ) : (
                  <Button
                    tag="a"
                    href={onboardingHref}
                    variant={ButtonVariant.Primary}
                    className="mt-4 w-fit"
                    onClick={logHijackingClick}
                  >
                    {CONTROL_COPY.onboarding.cta}
                  </Button>
                )
              }
            />
            <ControlMediaPanel>
              <img
                src={cloudinaryReadingReminderCat}
                alt="Sleeping cat on laptop"
                className="m-0 h-full w-full max-w-none scale-105 object-contain laptopL:scale-110"
              />
            </ControlMediaPanel>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HijackingHeroStrip({
  variant: experimentVariant,
  onboardingHandoff = false,
  copy = LIVE_COPY,
  className,
}: {
  variant: Exclude<HijackingVariant, HijackingVariant.Default>;
  onboardingHandoff?: boolean;
  copy?: HijackingCopy;
  className?: string;
}): ReactElement {
  const { showLogin, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { signBack, provider, isLoaded: isSignBackLoaded } = useSignBack();
  const hasLoggedImpression = useRef(false);
  const authFormRef = useRef<HTMLFormElement>(
    null,
  ) as unknown as AuthOptionsProps['formRef'];

  const isAuthVariant = experimentVariant === HijackingVariant.Auth;
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

  // The Auth arm runs auth inline (it renders AuthOptions), and so does every
  // arm on the webapp; only the extension hands off to the onboarding flow.
  const runsAuthInline = isAuthVariant || !onboardingHandoff;
  const onSignupClick = (): void => {
    logClick(TargetType.SignupButton);

    if (runsAuthInline) {
      showLogin({
        trigger: AuthTriggers.Onboarding,
        options: { isLogin: false },
      });
      return;
    }

    window.location.assign(onboardingHref);
  };

  const onLoginClick = (): void => {
    logClick(TargetType.LoginButton);

    if (runsAuthInline) {
      showLogin({
        trigger: AuthTriggers.Onboarding,
        options: { isLogin: true },
      });
      return;
    }

    window.location.assign(loginHref);
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
  const SigninHero = SigninHeroMap[experimentVariant];

  const chrome = (children: ReactNode): ReactElement => (
    <section className={classNames('w-full pb-0', feedStyles.cards, className)}>
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
      isLoggedOut={isLoggedOut}
      copy={copy}
      className={className}
    />
  );
}

export interface HijackingLoginStripProps {
  // The extension can't run social OAuth from its own origin (the API rejects
  // it with a 403), so its signed-out arms hand auth off to the webapp
  // onboarding flow instead of opening it inline.
  onboardingHandoff?: boolean;
  // Only evaluate the experiment (and render) while the surface can host it.
  enabled?: boolean;
  copy?: HijackingCopy;
  className?: string;
}

export default function HijackingLoginStrip({
  onboardingHandoff = false,
  enabled = true,
  copy = LIVE_COPY,
  className,
}: HijackingLoginStripProps): ReactElement | null {
  const { value, isLoading } = useConditionalFeature({
    feature: featureHijackingVariants,
    shouldEvaluate: enabled,
  });

  if (!enabled || isLoading) {
    return null;
  }

  const variant = value as HijackingVariant;

  if (variant in SigninHeroMap) {
    return (
      <HijackingHeroStrip
        variant={variant as keyof typeof SigninHeroMap}
        onboardingHandoff={onboardingHandoff}
        copy={copy}
        className={className}
      />
    );
  }

  return <DefaultHijackingStrip className={className} />;
}
