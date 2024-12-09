import React, { useLayoutEffect, useState, type ReactElement } from 'react';
import classNames from 'classnames';
import { OnboardingTitle } from './common';
import {
  cloudinaryAddToHomeScreen,
  cloudinaryPWA,
  cloudinaryPWAVideo,
} from '../../lib/image';
import { Image } from '../image/Image';
import { Typography } from '../typography/Typography';

export const OnboardingPWA = (): ReactElement => {
  const [video, setVideo] = useState<HTMLVideoElement>();

  useLayoutEffect(() => {
    if (video) {
      video.play();
    }
  }, [video]);

  return (
    <>
      <div
        className={classNames(
          'rounded-lg pointer-events-none absolute top-0 z-2 flex h-screen w-screen flex-col gap-4 p-6 opacity-0 backdrop-blur transition-all duration-200',
        )}
      >
        <OnboardingTitle className="mt-32">Scroll & Tap</OnboardingTitle>
        <Image
          loading="lazy"
          src={cloudinaryAddToHomeScreen}
          alt="Add to home screen"
          className="tablet:mx-auto tablet:w-1/2"
        />
        <div className="relative mx-auto">
          <div className="h-5 w-5 translate-y-12 rounded-full bg-white transition-all duration-300" />
          <span className="absolute top-4 h-16 w-5 rounded-20 bg-gradient-to-b from-white/50 to-transparent opacity-0 duration-500 ease-in-out" />
        </div>
      </div>
      <video
        ref={setVideo}
        className="absolute -bottom-8 max-h-screen w-full"
        poster={cloudinaryPWA}
        src={cloudinaryPWAVideo}
        muted
        autoPlay
        loop
        playsInline
        disablePictureInPicture
        controls={false}
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
