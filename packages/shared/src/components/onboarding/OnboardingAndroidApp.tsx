import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { Image } from '../image/Image';
import { cloudinaryAndroidApp } from '../../lib/image';
import { OnboardingTitle } from './common';
import { GooglePlayIcon } from '../icons/Google/Play';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';

export const OnboardingAndroidApp = (): ReactElement => {
  const { logEvent } = useLogContext();

  return (
    <>
      <Image className="absolute top-4 w-full" src={cloudinaryAndroidApp} />
      <OnboardingTitle className="z-1 !px-0">
        Byte-sized dev news on-the-go, download our mobile app!
      </OnboardingTitle>
      <Button
        tag="a"
        target="_blank"
        href={process.env.NEXT_PUBLIC_ANDROID_APP}
        onClick={() => {
          logEvent({
            event_name: LogEvent.DownloadApp,
          });
        }}
        icon={<GooglePlayIcon />}
        className="z-1 mb-8 h-fit max-w-fit px-6 py-3"
        variant={ButtonVariant.Primary}
      >
        Download from Google Play
      </Button>
    </>
  );
};
