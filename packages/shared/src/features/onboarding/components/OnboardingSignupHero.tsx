import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '../../../lib/image';

type Props = {
  children: ReactNode;
  isFormExpanded?: boolean;
};

export const OnboardingSignupHero = ({
  children,
  isFormExpanded = false,
}: Props): ReactElement => (
  <div className="relative flex min-h-dvh w-full overflow-hidden bg-raw-pepper-90 text-text-primary">
    <picture className="pointer-events-none absolute inset-0 -z-1">
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
        src={cloudinaryOnboardingFullBackgroundDesktop}
        className={classNames(
          'size-full object-cover transition-opacity duration-300',
          isFormExpanded ? 'opacity-20' : 'opacity-100',
        )}
        loading="eager"
        fetchPriority="high"
      />
    </picture>

    <div
      aria-hidden
      className="from-black/30 via-black/60 to-black/90 tablet:from-black/20 tablet:to-black/90 pointer-events-none absolute inset-0 -z-1 bg-gradient-to-b tablet:bg-gradient-to-r tablet:via-black/40"
    />

    <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-center px-5 py-10 tablet:justify-end tablet:px-10 laptop:py-14 laptop:pr-[8vw]">
      <div className="flex w-full max-w-[26rem] flex-col gap-8">
        <Logo
          position={LogoPosition.Relative}
          className="!left-0 !top-0 !mt-0 !translate-x-0"
          logoClassName={{ container: 'h-7' }}
        />

        {!isFormExpanded && (
          <h1 className="text-balance font-bold leading-[1.05] tracking-tight text-text-primary typo-large-title tablet:typo-mega3">
            Your homepage,
            <br />
            ranked by developers.
          </h1>
        )}

        {children}
      </div>
    </main>
  </div>
);

export default OnboardingSignupHero;
