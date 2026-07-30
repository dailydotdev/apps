import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import { FooterLinks } from '../../../components/footer/FooterLinks';
import SignupDisclaimer from '../../../components/auth/SignupDisclaimer';
import { OnboardingHeader } from '../../../components/onboarding/OnboardingHeader';
import { wrapperMaxWidth } from '../../../components/onboarding/common';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type {
  FunnelSignupHeroBackground,
  FunnelSignupHeroImageMode,
} from '../types/funnel';
import { HERO_STYLES } from './signupHero/heroStyles';
import { HeroBackgroundLayer } from './signupHero/HeroBackgroundLayer';
import { AuroraOrbs } from './signupHero/HeroDecorations';
import { LandingHeroCover } from './signupHero/LandingHeroCover';
import { LandingAppInstall } from './signupHero/LandingAppInstall';
import { cloudinaryOnboardingLoginBackground } from '../../../lib/image';
import { sanitizeMessage } from '../lib/utils';

// =============================================================
// Onboarding signup hero — a shell that composes individually
// toggleable building blocks (background, orbs) driven by funnel
// parameters. There is intentionally no runtime switcher: every
// block is selected by the props passed in from the step.
//
// The halo/vignette is a legibility treatment intrinsic to the
// backgrounds that need it (desk photo, split layout) rather than a
// standalone toggle.
// =============================================================

type Props = {
  children: ReactNode;
  isFormExpanded?: boolean;
  headline?: string | null;
  background?: FunnelSignupHeroBackground;
  imageMode?: FunnelSignupHeroImageMode;
  imageMobile?: string;
  showOrbs?: boolean;
  forceDarkTheme?: boolean;
};

const DEFAULT_HEADLINE = 'The homepage every developer deserves.';
const SIGNUP_CONTENT_MAX_W = 'max-w-[360px]';
// The expanded email form is intentionally wider than the marketing wall so the
// fields have more room; kept as a named constant to document the deliberate
// difference from SIGNUP_CONTENT_MAX_W.
const SIGNUP_FORM_MAX_W = 'max-w-[440px]';
// The panel's column is as wide as the expanded form, not the marketing wall:
// the footer links and the disclaimer each need that width to stay on one line.
const SIGNUP_SPLIT_COLUMN_MAX_W = SIGNUP_FORM_MAX_W;

export const OnboardingSignupHero = ({
  children,
  isFormExpanded = false,
  headline = DEFAULT_HEADLINE,
  background = 'cards',
  imageMode = 'image',
  imageMobile = cloudinaryOnboardingLoginBackground,
  showOrbs = true,
  forceDarkTheme = true,
}: Props): ReactElement => {
  const { applyThemeMode } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  useEffect(() => {
    if (!forceDarkTheme) {
      return undefined;
    }
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode, forceDarkTheme]);

  const isSplitLayout = background === 'split';
  const isDeskVariant = background === 'desk';
  const isPanelLayout = background === 'panel';
  const showOrbsLayer = showOrbs;

  // Once the user moves to the email registration / verification step, drop the
  // marketing shell (feed-cards background, orbs, centered logo, bottom-anchored
  // form) in favor of a clean, top-aligned form screen with the logo in the
  // top-left. The form supplies its own "Sign up" title. Same treatment on all
  // breakpoints.
  if (isFormExpanded) {
    return (
      <div className="relative z-3 flex min-h-dvh w-full flex-col overflow-x-hidden bg-background-default text-text-primary">
        <header className="flex w-full px-6 pt-6 tablet:px-10 tablet:pt-8">
          <Logo
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0"
            logoClassName={{ container: 'h-5' }}
          />
        </header>
        <main className="flex w-full flex-1 flex-col items-center px-5 pb-6 pt-8 tablet:pt-12">
          <div
            className={classNames(
              'flex w-full flex-col gap-6 tablet:gap-7',
              SIGNUP_FORM_MAX_W,
            )}
          >
            {children}
          </div>
        </main>
        <div className="pointer-events-auto flex w-full flex-col items-center gap-3 px-5 pb-4 tablet:hidden">
          <div className="[&_footer]:!pb-0 [&_ul]:!mb-0">
            <FooterLinks />
          </div>
          <SignupDisclaimer className="!text-text-tertiary typo-caption1" />
        </div>
        <div className="pointer-events-auto hidden w-full items-end justify-between gap-6 px-6 pb-4 tablet:flex">
          <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-start">
            <FooterLinks />
          </div>
          <div className="max-w-sm text-right">
            <SignupDisclaimer className="!text-right !text-text-tertiary typo-caption1" />
          </div>
        </div>
      </div>
    );
  }

  // Marketing-landing parity: the signup wall reuses the exact same elements as
  // the other backgrounds (logo, headline, auth options, disclaimer, footer
  // links); only the shell around them changes. Above `laptop` the form sits in
  // a left column with the hero artwork framed in the right one. Below it the
  // layout stacks: the artwork takes the top of the screen and dissolves into
  // the page background, with the form bottom-anchored underneath.
  if (isPanelLayout) {
    const signupColumn = (
      <div
        className={classNames(
          'onb-hero-column flex w-full flex-col gap-6 tablet:gap-7 laptop:items-start laptop:gap-8',
          SIGNUP_SPLIT_COLUMN_MAX_W,
        )}
      >
        <Logo
          position={LogoPosition.Relative}
          className="onb-hero-logo !left-0 !top-0 !mt-0 !translate-x-0 self-center laptop:!self-start"
          logoClassName={{ container: 'h-7' }}
        />

        {headline && (
          <h1
            // no leading-* here: the typo-* utilities set their own line-height
            // and win the cascade, so it would be a dead class. The
            // onb-hero-headline hook drives the compact-phone step-down.
            className="onb-hero-headline text-balance text-center font-bold tracking-tight text-text-primary typo-large-title tablet:typo-mega3 laptop:text-left"
          >
            {headline}
          </h1>
        )}

        {children}
      </div>
    );

    return (
      <div className="onb-split relative isolate z-3 flex min-h-dvh w-full flex-col overflow-hidden bg-background-default text-text-primary laptop:grid laptop:grid-cols-2 laptop:items-stretch">
        <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

        <div className="relative z-1 flex min-w-0 flex-1 flex-col laptop:col-start-1 laptop:row-start-1 laptop:min-h-dvh">
          {/* Stacked, the artwork owns the top of the screen and dissolves into
              the page background over the lower part of it. It is absolute
              rather than in flow — at half the viewport there is no room left
              for the form otherwise — so the form bottom-anchors underneath and
              the two meet inside the gradient. */}
          <div
            aria-hidden
            className="onb-art-half pointer-events-none absolute inset-x-0 top-0 select-none overflow-hidden laptop:hidden"
          >
            <LandingHeroCover
              focus="subjectHigh"
              zoom
              className="absolute inset-0"
            />
            <div className="onb-art-fade absolute inset-x-0 bottom-0 h-3/5" />
          </div>

          <main
            // relative: the artwork layer is absolutely positioned in the same
            // stacking context, so static content would paint under it.
            // pb-10: below `tablet` the legal row is hidden, so nothing sits
            // under the form and the column has to carry its own bottom
            // breathing room (and clear the iOS home indicator). From `tablet`
            // up the legal row provides it instead.
            className="onb-hero-main relative z-1 flex w-full flex-1 flex-col items-center px-5 pb-10 tablet:pb-0 laptop:px-10"
          >
            {signupColumn}
          </main>

          {/* The legal row is constrained to the same column width as the form
              so its left edge lines up with the buttons above it.

              It appears from `tablet` up, which is exactly where the cards and
              desk walls put theirs: their `isMobile` branch (below `tablet`)
              renders neither FooterLinks nor SignupDisclaimer. Matching that
              keeps this variant consistent with what ships today rather than
              making it the only wall with a phone-width disclosure. The gap on
              phones is real but pre-existing and product-wide — see the PR
              description.

              Footer links stay `laptop`-only on top of that: seven links wrap
              into a block the size of the form on anything narrower. */}
          <div className="onb-split-legal pointer-events-auto relative z-1 hidden w-full flex-col items-center gap-3 px-5 pb-6 pt-5 tablet:flex laptop:px-10 laptop:pb-8 laptop:pt-0">
            <div
              className={classNames(
                'flex w-full flex-col items-center gap-3 laptop:items-start',
                SIGNUP_SPLIT_COLUMN_MAX_W,
              )}
            >
              {/* the seven links need ~465px at the default gap; nowrap plus a
                  slightly tighter gap keeps them on one line inside the column */}
              <div className="hidden laptop:block [&_footer]:!pb-0 [&_ul]:!mb-0 laptop:[&_ul]:!flex-nowrap laptop:[&_ul]:!justify-start laptop:[&_ul]:!gap-x-2.5">
                <FooterLinks />
              </div>
              <SignupDisclaimer className="!text-text-tertiary typo-caption1 laptop:!text-left" />
            </div>
          </div>
        </div>

        {/* The panel deliberately does NOT clip: its ambilight needs to spill
            past the column edge rather than being cut off at it. */}
        <div className="relative hidden p-10 laptop:col-start-2 laptop:row-start-1 laptop:block laptop:min-h-dvh">
          <LandingHeroCover variant="panel" ambilight className="h-full" />
          <LandingAppInstall className="absolute bottom-14 right-14" />
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="relative z-3 flex min-h-dvh w-full flex-col justify-end overflow-x-hidden bg-background-default pt-40 text-text-primary">
        <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
        <OnboardingHeader
          isLanding
          className="!-my-8 !justify-center bg-gradient-to-t from-background-default to-transparent py-8"
        />
        <div className="relative z-1 after:absolute after:inset-0 after:top-8 after:-z-1 after:bg-background-default">
          <div
            className={classNames(
              'flex w-full flex-col flex-wrap content-center justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6',
              wrapperMaxWidth,
            )}
          >
            <div className="mt-5 flex flex-1 flex-col tablet:my-5 tablet:flex-grow">
              {headline && (
                <div className="mb-8 flex flex-col gap-4">
                  <Typography
                    className="text-balance text-center"
                    color={TypographyColor.Primary}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeMessage(headline),
                    }}
                    type={TypographyType.Title2}
                  />
                </div>
              )}
              {children}
            </div>
            <div className="flex flex-1 tablet:ml-auto tablet:flex-1 laptop:max-w-[37.5rem]" />
          </div>
        </div>
        <img
          alt="Onboarding background"
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-1 size-full object-cover"
          loading="eager"
          role="presentation"
          src={imageMobile}
        />
      </div>
    );
  }

  const splitSignupColumn = (
    <>
      <main className="relative flex flex-1 flex-col items-center justify-end px-5 pb-6 pt-12 tablet:pb-[5.5rem] laptop:items-stretch laptop:justify-center laptop:px-16 laptop:pb-0 laptop:pt-0">
        <div
          className={classNames(
            'flex w-full flex-col gap-6 tablet:gap-7',
            SIGNUP_CONTENT_MAX_W,
            'laptop:items-start laptop:gap-8',
          )}
        >
          <Logo
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0 self-center laptop:!self-start"
            logoClassName={{ container: 'h-7' }}
          />

          {headline && (
            <h1 className="onb-headline text-balance text-center font-bold leading-[1.1] tracking-tight text-text-primary typo-title1 tablet:typo-large-title laptop:text-left">
              {headline}
            </h1>
          )}

          {children}
        </div>
      </main>

      <div className="pointer-events-auto hidden w-full flex-col items-start gap-3 px-5 pb-5 laptop:flex laptop:px-16 laptop:pb-8">
        <div className="w-full [&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-start">
          <FooterLinks />
        </div>
        <SignupDisclaimer className="!w-full !text-left !text-text-tertiary typo-caption1" />
      </div>
    </>
  );

  return (
    <div
      className={classNames(
        'relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-raw-pepper-90 text-text-primary',
        isSplitLayout
          ? 'onb-bg-split laptop:grid laptop:grid-cols-2'
          : 'onb-bg',
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      {!isSplitLayout && (
        <HeroBackgroundLayer background={background} imageMode={imageMode} />
      )}

      {isSplitLayout && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-1 select-none laptop:hidden"
        >
          <HeroBackgroundLayer background="split" imageMode={imageMode} />
          <div className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 h-[55vh]" />
          <div className="onb-form-halo pointer-events-none absolute inset-0" />
        </div>
      )}

      {isSplitLayout && (
        <div className="relative hidden min-h-dvh overflow-hidden laptop:col-start-1 laptop:row-start-1 laptop:block">
          <div
            aria-hidden
            className="onb-split-left-water-glow pointer-events-none absolute inset-0 -z-2"
          />
          <HeroBackgroundLayer background="split" imageMode={imageMode} />
          <div
            aria-hidden
            className="onb-split-left-fade pointer-events-none absolute inset-0 -z-1"
          />
          {showOrbsLayer && <AuroraOrbs variant="split" />}
        </div>
      )}

      {!isSplitLayout && showOrbsLayer && (
        <div
          aria-hidden
          data-testid="hero-orbs"
          className="pointer-events-none absolute inset-0 -z-1 select-none"
        >
          <AuroraOrbs variant="full" />
        </div>
      )}

      {isDeskVariant && (
        <>
          <div
            aria-hidden
            className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[55vh]"
          />
          <div
            aria-hidden
            data-testid="hero-halo"
            className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
          />
        </>
      )}

      <div
        aria-hidden
        className="onb-top-fade pointer-events-none absolute inset-x-0 top-0 -z-1 h-40 laptop:hidden"
      />
      {isDeskVariant && (
        <div
          aria-hidden
          className="onb-center-halo pointer-events-none absolute inset-0 -z-1"
        />
      )}

      {isSplitLayout ? (
        <div className="relative z-1 flex min-h-dvh flex-1 flex-col laptop:col-start-2 laptop:row-start-1 laptop:min-w-0">
          <div
            aria-hidden
            className="onb-split-right-panel pointer-events-none absolute inset-0 -z-1 hidden laptop:block"
          />
          {splitSignupColumn}
        </div>
      ) : (
        <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-end px-5 pb-6 pt-12 tablet:pb-[5.5rem] tablet:pt-14">
          <div
            className={classNames(
              'flex w-full flex-col gap-6 tablet:gap-7',
              SIGNUP_CONTENT_MAX_W,
            )}
          >
            <Logo
              position={LogoPosition.Relative}
              className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
              logoClassName={{ container: 'h-7' }}
            />

            {headline && (
              <h1 className="onb-headline text-balance text-center font-bold leading-[1.1] tracking-tight text-text-primary typo-title1 tablet:typo-large-title">
                {headline}
              </h1>
            )}

            {children}
          </div>
        </main>
      )}

      {!isSplitLayout && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-1 hidden items-end justify-between gap-6 px-6 pb-4 tablet:flex">
          {isDeskVariant ? (
            <>
              <div className="max-w-sm text-left">
                <SignupDisclaimer className="!text-left !text-text-tertiary typo-caption1" />
              </div>
              <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-end">
                <FooterLinks />
              </div>
            </>
          ) : (
            <>
              <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-start">
                <FooterLinks />
              </div>
              <div className="max-w-sm text-right">
                <SignupDisclaimer className="!text-right !text-text-tertiary typo-caption1" />
              </div>
            </>
          )}
        </div>
      )}

      <div
        className={classNames(
          'pointer-events-auto relative z-1 flex w-full flex-col items-center gap-3 px-5',
          isSplitLayout ? 'laptop:hidden' : 'tablet:hidden',
        )}
      >
        <div className="[&_footer]:!pb-0 [&_ul]:!mb-0">
          <FooterLinks />
        </div>
        <SignupDisclaimer className="!text-text-tertiary typo-caption1" />
      </div>

      <div className="h-3 w-full tablet:hidden" />
    </div>
  );
};
