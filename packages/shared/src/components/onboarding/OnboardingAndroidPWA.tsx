import type { ReactElement } from 'react';
import React from 'react';
import { OnboardingTitle } from './common';
import {
  cloudinaryAndroidPWAVideo,
  cloudinaryAndroidPWA,
} from '../../lib/image';
import { Typography } from '../typography/Typography';

export const OnboardingAndroidPWA = (): ReactElement => {
  return (
    <>
      <div className="rounded-lg pointer-events-none absolute top-0 z-2 flex h-screen w-screen flex-col gap-4 p-6 opacity-0 backdrop-blur transition-all duration-200" />
      <video
        className="absolute top-0 max-h-screen w-full"
        poster={cloudinaryAndroidPWA}
        src={cloudinaryAndroidPWAVideo}
        muted
        autoPlay
        loop
        playsInline
        disablePictureInPicture
        controls={false}
      />
      <div className="z-1 flex flex-col gap-4">
        <OnboardingTitle className="!px-0">
          Add daily.dev to Home Screen
        </OnboardingTitle>
        <Typography className="text-center text-text-tertiary typo-body">
          Tap “Add to Home Screen” below to get daily.dev at your fingertips,
          anytime you need it.
        </Typography>
      </div>
    </>
  );
};
