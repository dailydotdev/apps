import React, { ReactElement } from 'react';
import Link from 'next/link';
import Logo, { LogoPosition } from './Logo';
import { OnboardingTitleGradient } from './onboarding/common';
import { onboardingUrl } from '../lib/constants';
import { Button, ButtonSize } from './buttons/Button';
import { cloudinary } from '../lib/image';

interface Props {
  onContinue?: (url: string) => void;
}

const ExtensionOnboarding = ({ onContinue }: Props): ReactElement => {
  return (
    <div className="flex overflow-hidden flex-col justify-center items-center px-7 antialiased text-center min-h-[100vh] max-h-[100vh]">
      <Logo position={LogoPosition.Relative} logoClassName="h-logo-big" />

      <OnboardingTitleGradient className="my-6 typo-mega2 tablet:typo-mega1">
        Let&apos;s jump back&nbsp;in!
      </OnboardingTitleGradient>

      <p className="mb-9 tablet:mb-16 max-w-[25rem] typo-title3 tablet:typo-title2">
        Please resume onboarding to unlock the entire feature suite of
        daily.dev.
        <br />
        The magic awaits inside! ✨
      </p>

      {/* <Link href={onboardingUrl} passHref> */}
      <Button
        // tag="a"
        className="z-1 w-full btn-primary max-w-[18.75rem]"
        buttonSize={ButtonSize.Large}
        onClick={() => onContinue(onboardingUrl)}
      >
        Continue ➔
      </Button>
      {/* </Link> */}

      <img
        className="absolute bottom-0 z-0 w-[33rem]"
        src={cloudinary.onboarding.glow}
        alt="Gradient background"
      />
    </div>
  );
};

export default ExtensionOnboarding;
