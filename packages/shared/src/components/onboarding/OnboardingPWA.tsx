import type { ReactElement } from 'react';
import React from 'react';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
  OnboardingTitle,
} from './common';
import { Typography } from '../typography/Typography';
import {
  cloudinaryPWA,
  cloudinaryMobilePWAChrome,
  cloudinaryPWAVideo,
  cloudinaryPWAVideoChrome,
} from '../../lib/image';
import { checkIsChromeOnly } from '../../lib/func';

const DEFAULT_PWA_HEADLINE = 'Add daily.dev to Home Screen';
const PWA_EXPLAINER =
  'Tap “Add to Home Screen” below to get daily.dev at your fingertips, anytime you need it.';

interface OnboardingPWAProps {
  headline?: string;
  // The paid funnel keeps main's smaller title pair.
  isOnboarding?: boolean;
}

export const OnboardingPWA = ({
  headline,
  isOnboarding,
}: OnboardingPWAProps): ReactElement => {
  const isChrome = checkIsChromeOnly();
  const footage = {
    poster: isChrome ? cloudinaryMobilePWAChrome : cloudinaryPWA,
    src: isChrome ? cloudinaryPWAVideoChrome : cloudinaryPWAVideo,
  };

  if (isOnboarding) {
    return (
      <>
        <div className="flex flex-col gap-6">
          <OnboardingHeadline>
            {headline || DEFAULT_PWA_HEADLINE}
          </OnboardingHeadline>
          <OnboardingSubheadline>{PWA_EXPLAINER}</OnboardingSubheadline>
        </div>
        {/* In flow, not an absolute full-screen layer: at `w-full` the
            footage's aspect ratio made it tall enough on a wide phone to reach
            into the subheadline. Bottom-anchored — its top third is empty. */}
        <video
          {...footage}
          className="max-h-[45dvh] w-full max-w-64 object-cover object-bottom"
          muted
          autoPlay
          loop
          playsInline
          disablePictureInPicture
          controls={false}
        />
      </>
    );
  }

  return (
    <>
      <div className="rounded-lg pointer-events-none absolute top-0 z-2 flex h-screen w-screen flex-col gap-4 p-6 opacity-0 backdrop-blur transition-all duration-200" />
      <video
        {...footage}
        className="absolute top-0 max-h-screen w-full"
        muted
        autoPlay
        loop
        playsInline
        disablePictureInPicture
        controls={false}
      />
      <div className="z-1 flex flex-col gap-4">
        <OnboardingTitle className="!px-0">
          {headline || DEFAULT_PWA_HEADLINE}
        </OnboardingTitle>
        <Typography className="text-center text-text-tertiary typo-body">
          {PWA_EXPLAINER}
        </Typography>
      </div>
    </>
  );
};
