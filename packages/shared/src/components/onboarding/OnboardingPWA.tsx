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
        {/* The area's top edge is in flow so the footage can never reach the
            subheadline, while the height overshoot lets it run on under the
            translucent glass bar. An explicit height, not `bottom`: a replaced
            element's intrinsic ratio wins over an inset pair. The 7rem must
            stay below the bar rail's minimum height — past the page bottom it
            would make the step scroll. `cover` + `object-bottom` scales the
            footage up to fill the whole area; the overflow it sheds at the top
            is the frame's own blank third. */}
        <div className="relative w-full flex-1">
          <video
            {...footage}
            className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100%+7rem)] w-full object-cover object-bottom"
            muted
            autoPlay
            loop
            playsInline
            disablePictureInPicture
            controls={false}
          />
        </div>
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
