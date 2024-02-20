import React, { ReactElement } from 'react';
import Link from 'next/link';
import Logo, { LogoPosition } from './Logo';
import { OnboardingTitleGradient } from './onboarding/common';
import { onboardingUrl } from '../lib/constants';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { cloudinary } from '../lib/image';

const ExtensionOnboarding = (): ReactElement => {
  return (
    <div className="flex max-h-[100vh] min-h-[100vh] flex-col items-center justify-center overflow-hidden px-7 text-center antialiased">
      <Logo position={LogoPosition.Relative} logoClassName="h-logo-big" />

      <OnboardingTitleGradient className="my-6 typo-mega2 tablet:typo-mega1">
        Let&apos;s jump back&nbsp;in!
      </OnboardingTitleGradient>

      <p className="mb-9 max-w-[25rem] typo-title3 tablet:mb-16 tablet:typo-title2">
        Please resume onboarding to unlock the entire feature suite of
        daily.dev.
        <br />
        The magic awaits inside! ✨
      </p>

      <Link href={onboardingUrl} passHref>
        <Button
          tag="a"
          className="z-1 w-full max-w-[18.75rem]"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
        >
          Continue ➔
        </Button>
      </Link>

      <img
        className="absolute bottom-0 z-0 w-[33rem]"
        src={cloudinary.onboarding.glow}
        alt="Gradient background"
      />
    </div>
  );
};

export default ExtensionOnboarding;
