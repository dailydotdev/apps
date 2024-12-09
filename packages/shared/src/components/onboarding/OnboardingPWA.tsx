import React, { type ReactElement } from 'react';
import classNames from 'classnames';
import { OnboardingTitle } from './common';
import { cloudinaryPWA, cloudinaryPWAVideo } from '../../lib/image';
import { Typography } from '../typography/Typography';

export const OnboardingPWA = (): ReactElement => {
  return (
    <>
      <div
        className={classNames(
          'rounded-lg pointer-events-none absolute top-0 z-2 flex h-screen w-screen flex-col gap-4 p-6 opacity-0 backdrop-blur transition-all duration-200',
        )}
      />
      <video
        className="absolute -bottom-8 max-h-screen w-full"
        poster={cloudinaryPWA}
        src={cloudinaryPWAVideo}
        muted
        autoPlay
        loop
        playsInline
        disablePictureInPicture
      >
        <track kind="captions" />
      </video>
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
