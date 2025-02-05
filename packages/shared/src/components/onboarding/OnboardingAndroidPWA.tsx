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
      <video
        className="absolute bottom-0 max-h-screen w-full"
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
