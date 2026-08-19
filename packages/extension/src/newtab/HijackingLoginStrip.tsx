import type { ReactElement, ReactNode, RefObject } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import { MemberAlready } from '@dailydotdev/shared/src/components/onboarding/MemberAlready';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  AuthDisplay,
  type AuthOptionsProps,
  OnboardingActions,
  providerMap,
  type SocialProvider,
} from '@dailydotdev/shared/src/components/auth/common';
import { onboardingGradientClasses } from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  cloudinaryHijackingCoverArt,
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
  cloudinaryReadingReminderCat,
} from '@dailydotdev/shared/src/lib/image';
import {
  featureHijackingVariants,
  HijackingVariant,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';

type CoverVariant = 'continue' | 'signin' | 'onboarding';

const primaryCta =
  'transition-transform duration-200 ease-out hover:-translate-y-0.5';

const glassCta =
  '!border-white/20 !bg-white/[0.06] !text-white backdrop-blur-sm transition-colors duration-200 hover:!bg-white/[0.12]';

// The extension can't run social OAuth from its own origin (the API rejects it
// with a 403). The CTA arm hands auth off to the webapp onboarding flow, which
// runs on a trusted origin and auto-triggers the relevant auth screen.
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
        Sign up
      </Button>
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Medium}
        className={classNames('flex-1', glassCta)}
        onClick={onLoginClick}
      >
        Log in
      </Button>
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
}: SigninHeroProps): ReactElement {
  return (
    <section className={classNames('mb-4 w-full pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
        <div className="top-hero-stage pointer-events-none absolute inset-0" />
        <div className="top-hero-aurora opacity-70 pointer-events-none absolute inset-0" />
        <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -bottom-8 left-1/2 h-32 w-[82%] -translate-x-1/2 rounded-[100%] blur-2xl" />
        <div className="via-accent-cabbage-default/80 pointer-events-none absolute bottom-0 left-1/2 h-px w-[86%] -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
        <div className="dark relative z-1 flex flex-col tablet:flex-row tablet:items-stretch">
          <div className="flex flex-1 flex-col items-center p-5 text-center tablet:items-start tablet:p-6 tablet:text-left">
            <div className="flex flex-col items-center gap-1 tablet:items-start">
              <h3 className="font-bold text-white typo-title2">
                Own your new tab. Make it your dev briefing.
              </h3>
              <p className="text-white/70 text-sm">
                Sign in and daily.dev remembers the topics, saves, and
                discussions that matter to you.
              </p>
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

// The cover arms stay pinned in every auth state, so their placement lives
// Both arms stay in flow so the card spans the feed column edge to edge, like
// the cards themselves. The bottom arm renders after the feed, which is what
// lets `sticky bottom` pull it up into view: from a slot above the feed its
// natural position is already on screen and sticky does nothing. Neither arm
// takes horizontal padding — the control insets itself by 16px, so these are
// that much wider by design, and the sizer's copy is fixed so the extra width
// can't change how it wraps.
// The global header is `fixed top-0 h-14 laptop:h-16` at z-header, so the top
// arm has to pin below it or it slides underneath and gets clipped. That header
// is hidden under the v2 layout, where the sidebar owns it, so the offset only
// applies when it is actually on screen.
const coverSectionClasses = (isBottom: boolean): string =>
  classNames(
    'w-full pb-0',
    feedStyles.cards,
    isBottom ? 'sticky bottom-4 z-rank mt-4' : 'sticky z-rank mb-4',
  );

// Keeps the pinned card clear of the chrome above it, plus a gap so it reads
// as floating rather than welded to the header. The offset is measured, not
// assumed: the header is one row on laptop but stacks a nav row under the logo
// on phones and tablets, and the v2 layout drops it entirely — a constant is
// wrong on at least one of those.
const PINNED_GAP = 8;
// The chrome above the feed is not always a <header>: on phones and tablets
// MainLayoutHeader returns <FeedNav />, whose root is a sticky <div>. What the
// two share is the `z-header` layer, so match on that as well as the tags.
const TOP_CHROME_SELECTOR = 'header, nav, [role="banner"], [class*="z-header"]';

const measureTopChrome = (): number => {
  if (typeof document === 'undefined') {
    return 0;
  }

  let bottom = 0;

  document
    .querySelectorAll<HTMLElement>(TOP_CHROME_SELECTOR)
    .forEach((element) => {
      const { position } = window.getComputedStyle(element);

      if (position !== 'fixed' && position !== 'sticky') {
        return;
      }

      const rect = element.getBoundingClientRect();

      // Only chrome actually parked against the top edge can cover the card.
      if (rect.top > PINNED_GAP || rect.height === 0) {
        return;
      }

      bottom = Math.max(bottom, rect.bottom);
    });

  return bottom;
};

/** Tracks the bottom edge of whatever is pinned above the feed. */
const useTopChromeOffset = (enabled: boolean): number => {
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    if (!enabled) {
      setOffset(0);

      return undefined;
    }

    // Measured synchronously rather than on an animation frame: the first
    // paint has to land on the right offset, and React drops the update when
    // the value is unchanged, so the scroll listener stays cheap.
    const update = (): void => setOffset(measureTopChrome());

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return offset;
};

// The dog and the person sit in this band of the artwork, measured from its
// top edge. The strip is far wider than it is tall, so `object-cover` scales
// the art up and crops most of its height — where that band lands depends on
// the card's width, and no single percentage keeps the pair in frame across
// the range. The crop is therefore measured rather than guessed.
const SUBJECT_TOP_FRACTION = 0.67;

/**
 * Anchors the artwork so its subject sits just under the CTA row at any width.
 * Falls back to a centred crop when the art is not tall enough to crop.
 */
const useCoverArtAnchor = (
  art: RefObject<HTMLImageElement>,
  card: RefObject<HTMLElement>,
  cta: RefObject<HTMLElement>,
): void => {
  useLayoutEffect(() => {
    const artEl = art.current;
    const cardEl = card.current;
    const ctaEl = cta.current;

    if (!artEl || !cardEl || !ctaEl) {
      return undefined;
    }

    const update = (): void => {
      const width = cardEl.clientWidth;
      const height = cardEl.clientHeight;

      if (!width || !height || !artEl.naturalWidth) {
        return;
      }

      const scaledHeight = artEl.naturalHeight * (width / artEl.naturalWidth);
      const overflow = scaledHeight - height;

      if (overflow <= 0) {
        artEl.style.objectPosition = '50% 50%';
        return;
      }

      const ctaBottom =
        ctaEl.getBoundingClientRect().bottom -
        cardEl.getBoundingClientRect().top;
      const subjectTop = SUBJECT_TOP_FRACTION * scaledHeight;
      const offset = Math.min(
        Math.max(subjectTop - ctaBottom - 4, 0),
        overflow,
      );

      artEl.style.objectPosition = `50% ${(offset / overflow) * 100}%`;
    };

    update();
    artEl.addEventListener('load', update);
    const observer = new ResizeObserver(update);
    observer.observe(cardEl);

    return () => {
      artEl.removeEventListener('load', update);
      observer.disconnect();
    };
  }, [art, card, cta]);
};

const coverCardClasses = (): string =>
  'relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2';

// Banner height is a controlled variable in the header-ad-impression
// experiment, so at tablet and up an invisible in-flow block reproduces the
// control's row geometry — its copy, paddings and media-panel widths — and the
// visible content overlays it. Stacked, that geometry is mostly dead artwork
// below the copy, so the vertical layout keeps the text block only.
function CoverSignupHero({
  onSignupClick,
  onLoginClick,
  position = 'top',
}: SigninHeroProps & { position?: 'top' | 'bottom' }): ReactElement {
  const isBottom = position === 'bottom';
  const topChrome = useTopChromeOffset(!isBottom);
  const artRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useCoverArtAnchor(artRef, cardRef, ctaRef);

  return (
    <section
      className={coverSectionClasses(isBottom)}
      style={isBottom ? undefined : { top: topChrome + PINNED_GAP }}
    >
      <div className={coverCardClasses()} ref={cardRef}>
        <img
          ref={artRef}
          src={cloudinaryHijackingCoverArt}
          alt=""
          aria-hidden
          role="presentation"
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <div className="cover-hero-dome pointer-events-none absolute inset-0" />
        <div className="from-raw-pepper-90/70 pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent" />
        <div
          aria-hidden
          className="invisible hidden tablet:flex tablet:flex-row tablet:items-stretch"
        >
          {/* The control's own text block, element for element — a real
              Button included, so its box model tracks the design system
              instead of a hand-guessed spacer height. */}
          <div className="flex flex-1 flex-col items-center p-5 tablet:items-start tablet:p-6">
            <div className="flex flex-col items-center gap-1 tablet:items-start">
              <h3 className="font-bold typo-title2">
                Unlock the full daily.dev experience
              </h3>
              <p className="text-sm">Log in to pick up where you left off.</p>
              <Button variant={ButtonVariant.Primary} className="mt-4 w-fit">
                Log in to continue
              </Button>
            </div>
          </div>
          {/* The control's media panel sets the row height from its artwork's
              intrinsic ratio, so an empty box of the same ratio reserves the
              identical space — a hidden <img> would still cost the download on
              every new tab. 1040x758 is the control cat's natural size. */}
          <div className="hidden w-full p-2 tablet:block tablet:w-[14.5rem] tablet:p-3 laptopL:w-[16rem]">
            <div className="w-full" style={{ aspectRatio: '1040 / 758' }} />
          </div>
        </div>
        {/* Extra bottom padding lifts the centred copy, leaving the band
            under the CTA free for the artwork's subject. */}
        {/* Stacked, the copy is taller than the control's row geometry, so it
            sits in flow and gives the card its height with even padding on
            every side — absolutely positioned it overflowed and clipped its
            own heading. From tablet up the control's geometry is what the
            experiment holds constant, so the copy overlays it again. */}
        <div className="dark relative z-1 flex flex-col items-center justify-center p-5 text-center tablet:absolute tablet:inset-0 tablet:pb-14">
          <h3 className="font-bold text-white typo-title2 [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
            Start discovering what&apos;s next.
          </h3>
          <p className="text-white/80 mt-1 max-w-[34rem] text-balance text-sm [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            The feed 1M+ developers open on every new tab. Free forever.
          </p>
          <div
            className="mt-4 flex flex-row justify-center gap-2.5"
            ref={ctaRef}
          >
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
              Get started
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
              Log in
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoverBottomSignupHero(props: SigninHeroProps): ReactElement {
  return <CoverSignupHero {...props} position="bottom" />;
}

const SigninHeroMap = {
  [HijackingVariant.CTA]: CatStageHero,
  [HijackingVariant.Auth]: OnboardingSignupHero,
  [HijackingVariant.Cover]: CoverSignupHero,
  [HijackingVariant.CoverBottom]: CoverBottomSignupHero,
} satisfies Record<
  Exclude<HijackingVariant, HijackingVariant.Default>,
  (props: SigninHeroProps) => ReactElement
>;

function DefaultHijackingStrip(): ReactElement {
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
    <section className={classNames('mb-4 w-full px-4 pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
        <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
        <div className="top-hero-glow pointer-events-none absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2">
          <div className="flex flex-col tablet:flex-row tablet:items-stretch">
            <div className="flex flex-1 flex-col items-center p-5 text-center tablet:items-start tablet:p-6 tablet:text-left">
              <div className="flex flex-col items-center gap-1 tablet:items-start">
                <h3 className="font-bold text-white typo-title2">
                  Unlock the full daily.dev experience
                </h3>
                <p className="text-white/80 text-sm">
                  {isLoggedOut
                    ? 'Log in to pick up where you left off.'
                    : 'You still have a few onboarding steps left. Finish them to unlock the full experience.'}
                </p>
                {isLoggedOut ? (
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
                    Log in to continue
                  </Button>
                ) : (
                  <Button
                    tag="a"
                    href={onboardingHref}
                    variant={ButtonVariant.Primary}
                    className="mt-4 w-fit"
                    onClick={logHijackingClick}
                  >
                    Continue onboarding
                  </Button>
                )}
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
      </div>
    </section>
  );
}

function HijackingHeroStrip({
  variant: experimentVariant,
}: {
  variant: Exclude<HijackingVariant, HijackingVariant.Default>;
}): ReactElement {
  const { showLogin, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { signBack, provider, isLoaded: isSignBackLoaded } = useSignBack();
  const chromeTopOffset = useTopChromeOffset(
    experimentVariant === HijackingVariant.Cover,
  );
  const hasLoggedImpression = useRef(false);
  const authFormRef = useRef<HTMLFormElement>(
    null,
  ) as unknown as AuthOptionsProps['formRef'];

  // Only the Auth arm can run auth inline; the extension's own origin is
  // rejected by the OAuth API (403), so every other arm hands off to the
  // webapp onboarding flow.
  const isAuthVariant = experimentVariant === HijackingVariant.Auth;
  const isBottomVariant = experimentVariant === HijackingVariant.CoverBottom;
  const isCoverVariant =
    isBottomVariant || experimentVariant === HijackingVariant.Cover;
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

  // The Auth arm runs auth inline (it renders AuthOptions); the CTA arm hands
  // off to the webapp onboarding flow to avoid the extension OAuth-origin 403.
  const onSignupClick = (): void => {
    logClick(TargetType.SignupButton);

    if (isAuthVariant) {
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

    if (isAuthVariant) {
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

  // The sign-back and onboarding states share one card across every arm. The
  // cover arms keep their placement here too, otherwise a remembered visitor
  // would see the strip jump out of its pinned position the moment sign-back
  // storage resolves.
  const chrome = (children: ReactNode): ReactElement => (
    <section
      className={
        isCoverVariant
          ? coverSectionClasses(isBottomVariant)
          : classNames('mb-4 w-full pb-0', feedStyles.cards)
      }
      style={
        isCoverVariant && !isBottomVariant
          ? { top: chromeTopOffset + PINNED_GAP }
          : undefined
      }
    >
      <div
        className={
          isCoverVariant
            ? coverCardClasses()
            : 'relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2'
        }
      >
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

export type HijackingPlacement = 'shortcuts' | 'aboveFeed' | 'belowFeed';

/**
 * Which slot the strip has to render into for its arm to behave. `shortcuts`
 * lands inside FeedContainer's search `<header>`, where a sticky child has no
 * travel, so the pinned arms need a container that spans the feed: above it for
 * the top arm, and after it for the bottom one — `sticky bottom` can only pull
 * an element up into view, so from a slot above the feed it does nothing.
 * Both slots sit inside the feed column, which every layout renders;
 * MainLayout's `topBanner` does not qualify — it only exists under v2.
 */
export const useHijackingPlacement = (): HijackingPlacement => {
  const { isV2 } = useLayoutVariant();
  const { value, isLoading } = useConditionalFeature({
    feature: featureHijackingVariants,
    shouldEvaluate: !isV2,
  });

  if (isLoading) {
    return 'shortcuts';
  }

  if (value === HijackingVariant.Cover) {
    return 'aboveFeed';
  }

  return value === HijackingVariant.CoverBottom ? 'belowFeed' : 'shortcuts';
};

export default function HijackingLoginStrip(): ReactElement | null {
  // The v2 layout drops the slot the control renders through, so the control
  // shows nothing there while the cover arms — which render from the feed
  // column — would still show. Enrolling those users would compare "no strip"
  // against "a strip" rather than one design against another, so the flag is
  // not evaluated for them at all and no arm renders.
  const { isV2 } = useLayoutVariant();
  const { value, isLoading } = useConditionalFeature({
    feature: featureHijackingVariants,
    shouldEvaluate: !isV2,
  });

  if (isV2 || isLoading) {
    return null;
  }

  const hijackingVariant = value as HijackingVariant;

  // Derived from the map rather than listed again, so a new arm can't be added
  // to the enum and the map yet silently fall through to the control here. An
  // unrecognized remote value still lands on the control.
  if (hijackingVariant in SigninHeroMap) {
    return (
      <HijackingHeroStrip
        variant={hijackingVariant as keyof typeof SigninHeroMap}
      />
    );
  }

  return <DefaultHijackingStrip />;
}
