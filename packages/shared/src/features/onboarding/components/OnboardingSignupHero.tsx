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
            logoClassName={{ container: 'h-7' }}
          />
        </header>
        <main className="flex w-full flex-1 flex-col items-center px-5 pb-6 pt-8 tablet:pt-12">
          <div
            className={classNames(
              'flex w-full flex-col gap-6 tablet:gap-7',
              SIGNUP_CONTENT_MAX_W,
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
              {!isFormExpanded && headline && (
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
          className={classNames(
            'pointer-events-none absolute inset-0 -z-1 size-full object-cover transition-opacity duration-150',
            { 'opacity-[.24]': isFormExpanded },
          )}
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

          {!isFormExpanded && headline && (
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

            {!isFormExpanded && headline && (
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
