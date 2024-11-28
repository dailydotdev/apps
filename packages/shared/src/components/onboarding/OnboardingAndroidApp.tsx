import React, { type ReactElement } from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { Image } from '../image/Image';
import { cloudinaryAndroidApp320w } from '../../lib/image';
import { OnboardingTitle } from './common';
import { GooglePlayIcon } from '../icons/Google/Play';

export const OnboardingAndroidApp = (): ReactElement => {
  return (
    <>
      <Image
        className="absolute bottom-0 left-0 w-full"
        src={cloudinaryAndroidApp320w}
      />
      <OnboardingTitle className="z-1">
        Byte-sized dev news on-the-go, download our mobile app!
      </OnboardingTitle>
      <Button
        tag="a"
        target="_blank"
        href={process.env.NEXT_PUBLIC_ANDROID_APP}
        icon={<GooglePlayIcon />}
        className="absolute bottom-4 left-0 right-0 m-auto h-fit max-w-fit px-6 py-3"
        variant={ButtonVariant.Primary}
      >
        Download from Google Play
      </Button>
    </>
  );
};
