import React, { type ReactElement } from 'react';
import { OnboardingTitle } from './common';
import { cloudinaryPWA, cloudinaryPWAVideo } from '../../lib/image';
import { Typography } from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import { checkIsBrowser, UserAgent } from '../../lib/func';

export const OnboardingPWA = (): ReactElement => {
  const isChrome = checkIsBrowser(UserAgent.Chrome);
  return (
    <>
      <div className="rounded-lg pointer-events-none absolute top-0 z-2 flex h-screen w-screen flex-col gap-4 p-6 opacity-0 backdrop-blur transition-all duration-200" />
      <video
        className="absolute top-0 max-h-screen w-full"
        poster={cloudinaryPWA}
        src={cloudinaryPWAVideo}
        muted
        autoPlay
        loop
        playsInline
        disablePictureInPicture
        controls={false}
      />
      {isChrome && (
        <Button
          className="absolute bottom-8 z-1"
          variant={ButtonVariant.Primary}
          type="button"
          onClick={() => {
            globalThis?.navigator.share({
              title: 'Daily.dev',
            });
          }}
        >
          PWA
        </Button>
      )}
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
