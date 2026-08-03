import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
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
  return (
    <>
      <div className="rounded-lg pointer-events-none absolute top-0 z-2 flex h-screen w-screen flex-col gap-4 p-6 opacity-0 backdrop-blur transition-all duration-200" />
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
      <div
        className={classNames(
          'z-1 flex flex-col',
          isOnboarding ? 'gap-6' : 'gap-4',
        )}
      >
        {isOnboarding ? (
          <>
            <OnboardingHeadline>
              {headline || DEFAULT_PWA_HEADLINE}
            </OnboardingHeadline>
            <OnboardingSubheadline>{PWA_EXPLAINER}</OnboardingSubheadline>
          </>
        ) : (
          <>
            <OnboardingTitle className="!px-0">
              {headline || DEFAULT_PWA_HEADLINE}
            </OnboardingTitle>
            <Typography className="text-center text-text-tertiary typo-body">
              {PWA_EXPLAINER}
            </Typography>
          </>
        )}
      </div>
    </>
  );
};
