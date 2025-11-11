import type { ReactElement } from 'react';
import React from 'react';
import { OnboardingTitle } from './common';
import {
  cloudinaryPWA,
  cloudinaryMobilePWAChrome,
  cloudinaryPWAVideo,
  cloudinaryPWAVideoChrome,
} from '../../lib/image';
import { Typography } from '../typography/Typography';
import { checkIsChromeOnly } from '../../lib/func';

interface OnboardingPWAProps {
  headline?: string;
}

export const OnboardingPWA = ({
  headline,
}: OnboardingPWAProps): ReactElement => {
  const isChrome = checkIsChromeOnly();
  return (
    <>
      <div className="z-2 pointer-events-none absolute top-0 flex h-screen w-screen flex-col gap-4 rounded-lg p-6 opacity-0 backdrop-blur transition-all duration-200" />
      <video
        className="absolute top-0 max-h-screen w-full"
        poster={isChrome ? cloudinaryMobilePWAChrome : cloudinaryPWA}
        src={isChrome ? cloudinaryPWAVideoChrome : cloudinaryPWAVideo}
        muted
        autoPlay
        loop
        playsInline
        disablePictureInPicture
        controls={false}
      />
      <div className="z-1 flex flex-col gap-4">
        <OnboardingTitle className="!px-0">
          {headline || 'Add daily.dev to Home Screen'}
        </OnboardingTitle>
        <Typography className="text-text-tertiary typo-body text-center">
          Tap “Add to Home Screen” below to get daily.dev at your fingertips,
          anytime you need it.
        </Typography>
      </div>
    </>
  );
};
