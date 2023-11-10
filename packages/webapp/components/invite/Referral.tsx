import React, { ReactElement, useEffect } from 'react';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import { useMedia } from '@dailydotdev/shared/src/hooks';
import { downloadBrowserExtension } from '@dailydotdev/shared/src/lib/constants';
import { FlexCentered } from '@dailydotdev/shared/src/components/utilities';
import BrowsersIcon from '@dailydotdev/shared/icons/browsers.svg';
import { laptopL } from '@dailydotdev/shared/src/styles/media';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import router from 'next/router';
import { DailyDevLogo, JoinPageProps } from './common';

export function Referral({
  referringUser,
  redirectTo,
}: JoinPageProps): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const { openModal } = useLazyModal();
  const isLaptopL = useMedia([laptopL.replace('@media ', '')], [true], false);
  const { isLoggedIn } = useAuthContext();

  const handleAcceptClick = () => {
    // since in the page view, query params are tracked automatically,
    // we don't need to send the params here explicitly
    trackEvent({ event_name: AnalyticsEvent.DownloadExtension });
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.push(redirectTo);
    }

    // router is an unstable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTo, isLoggedIn]);

  return (
    <div
      style={{
        backgroundImage: `url(${cloudinary.referralCampaign.genericReferral.backgroundDark})`,
      }}
      className="flex overflow-hidden relative flex-col laptop:flex-row flex-auto items-center p-2 laptop:p-6 h-screen bg-cover"
    >
      <DailyDevLogo />
      <div className="flex z-1 flex-col p-4 laptop:p-0 mt-20 laptop:mt-0 laptop:ml-3 w-full laptopL:ml-[9.25rem] laptop:max-w-[25rem] laptopL:max-w-[37.25rem]">
        <span className="flex flex-col laptop:flex-row gap-3 laptopL:gap-6 items-center laptop:items-start mb-7 tablet:mb-8">
          <ProfileImageLink
            user={referringUser}
            picture={{ size: isLaptopL ? 'xxxlarge' : 'xlarge' }}
          />
          <p className="my-auto text-center laptop:text-left typo-headline laptop:typo-title3 laptopL:typo-title2">
            <span className="block laptop:inline">{referringUser.name}</span>
            <span className="font-normal"> invited you to daily.dev</span>
          </p>
        </span>
        <h1 className="w-full text-center laptop:text-left break-words-overflow typo-large-title tablet:typo-mega2 laptopL:typo-giga2">
          The homepage
          <span className="block font-bold text-theme-color-cabbage">
            {' '}
            developers deserve
          </span>
        </h1>
        <p className="mx-auto laptop:mx-0 mt-7 tablet:mt-8 max-w-sm laptopL:max-w-xl text-center laptop:text-left typo-title3 text-theme-label-tertiary">
          Get a feed of the best developer news out there! Read more quality
          articles.
          <span className="tablet:block laptopL:inline">Stay up to date.</span>
        </p>
        <Button
          buttonSize={ButtonSize.Large}
          // important has been used is some classnames to override the default styles as agreed on [thread](https://dailydotdev.slack.com/archives/C05P9ET7S9K/p1699023366663489?thread_ts=1699011522.350609&cid=C05P9ET7S9K)
          className="p-4 mx-auto laptop:mx-0 mt-6 tablet:mt-12 max-w-[17.5rem] tablet:max-w-fit btn-primary tablet:!h-16 tablet:!p-0 tablet:!px-6"
          tag="a"
          href={downloadBrowserExtension}
          onClick={() => {
            handleAcceptClick();
          }}
          rel={anchorDefaultRel}
        >
          <FlexCentered className="gap-2 tablet:typo-title3">
            <BrowsersIcon className="tablet:w-20 tablet:h-10 text-theme-label-primary w-[3.7rem] h-[1.9rem]" />
            Try it now - It&apos;s free
          </FlexCentered>
        </Button>
      </div>
      <div className="flex fixed -bottom-1/2 flex-auto w-full h-full laptop:initial laptop:bottom-[unset]">
        <div className="flex relative laptop:absolute laptopL:-right-24 z-1 justify-center self-center m-auto mx-2 laptop:right-[-7.5rem] w-fit laptop:w-[initial]">
          <img
            src={
              cloudinary.referralCampaign.genericReferral.purpleEdgeGlowTablet
            }
            alt="Purple glow right edge"
            className="fixed laptop:top-0 -bottom-4 z-1 w-full laptop:w-auto laptop:h-full laptop:-rotate-90 laptop:bottom-[unset]"
          />
          <img
            src={cloudinary.referralCampaign.genericReferral.appScreenshot}
            alt="Daily.dev app screenshot of my feed page"
            className="object-contain z-0 w-full laptop:w-auto h-auto laptop:h-full laptopXL:max-h-[39.5rem] laptop:max-h-[25.35rem]"
          />
          <img
            src={cloudinary.referralCampaign.genericReferral.playButton}
            alt="Play daily.dev introduction video"
            className="absolute z-2 laptop:self-center laptopL:m-auto tablet:-mt-6 laptop:mt-2 laptop:h-32 laptopXL:h-auto laptop:mr-[8.5rem] tablet:h-[14.5rem] h-[7.5rem]"
          />
          <button
            className="absolute z-2 w-full h-full"
            type="button"
            aria-label="Play daily.dev introduction video"
            onClick={() => {
              openModal({
                type: LazyModal.Video,
                props: {
                  src: 'https://www.youtube.com/embed/igZCEr3HwCg',
                  title: 'YouTube video player',
                },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
