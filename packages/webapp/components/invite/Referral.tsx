import React, { ReactElement, useEffect } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { downloadBrowserExtension } from '@dailydotdev/shared/src/lib/constants';
import { FlexCentered } from '@dailydotdev/shared/src/components/utilities';
import BrowsersIcon from '@dailydotdev/shared/icons/browsers.svg';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import router from 'next/router';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { DailyDevLogo, JoinPageProps } from './common';

export function Referral({
  referringUser,
  redirectTo,
}: JoinPageProps): ReactElement {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const isLaptopL = useViewSize(ViewSize.LaptopL);
  const { isLoggedIn } = useAuthContext();

  const handleAcceptClick = () => {
    logEvent({ event_name: LogEvent.DownloadExtension });
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
      className="relative flex h-screen flex-auto flex-col items-center overflow-hidden bg-cover p-2 laptop:flex-row laptop:p-6"
    >
      <DailyDevLogo />
      <div className="z-1 mt-20 flex w-full flex-col p-4 laptop:ml-3 laptop:mt-0 laptop:max-w-[25rem] laptop:p-0 laptopL:ml-[9.25rem] laptopL:max-w-[37.25rem]">
        <span className="mb-7 flex flex-col items-center gap-3 tablet:mb-8 laptop:flex-row laptop:items-start laptopL:gap-6">
          <ProfileImageLink
            user={referringUser}
            picture={{
              size: isLaptopL
                ? ProfileImageSize.XXXLarge
                : ProfileImageSize.XLarge,
            }}
          />
          <p className="my-auto text-center typo-body laptop:text-left laptop:typo-title3 laptopL:typo-title2">
            <span className="block laptop:inline">{referringUser.name}</span>
            <span className="font-normal"> invited you to daily.dev</span>
          </p>
        </span>
        <h1 className="break-words-overflow w-full text-center typo-large-title tablet:typo-mega2 laptop:text-left laptopL:typo-giga2">
          The homepage
          <span className="block font-bold text-brand-default">
            {' '}
            developers deserve
          </span>
        </h1>
        <p className="mx-auto mt-7 max-w-sm text-center text-text-tertiary typo-title3 tablet:mt-8 laptop:mx-0 laptop:text-left laptopL:max-w-xl">
          We know how hard it is to be a developer. It doesn’t have to be.
          Personalized news feed, dev communities and search, much better than
          what’s out there. Maybe 😉
        </p>
        <Button
          size={ButtonSize.Large}
          variant={ButtonVariant.Primary}
          // important has been used is some classnames to override the default styles as agreed on [thread](https://dailydotdev.slack.com/archives/C05P9ET7S9K/p1699023366663489?thread_ts=1699011522.350609&cid=C05P9ET7S9K)
          className="mx-auto mt-6 max-w-[17.5rem] p-4 tablet:mt-12 tablet:!h-16 tablet:max-w-fit tablet:!p-0 tablet:!px-6 laptop:mx-0"
          tag="a"
          href={downloadBrowserExtension}
          onClick={() => {
            handleAcceptClick();
          }}
          rel={anchorDefaultRel}
        >
          <FlexCentered className="gap-2 tablet:typo-title3">
            <BrowsersIcon className="h-[1.9rem] w-[3.7rem] text-text-primary tablet:h-10 tablet:w-20" />
            Try it now - It&apos;s free
          </FlexCentered>
        </Button>
      </div>
      <div className="laptop:initial fixed -bottom-1/2 flex h-full w-full flex-auto laptop:bottom-[unset]">
        <div className="relative z-1 m-auto mx-2 flex w-fit justify-center self-center laptop:absolute laptop:right-[-7.5rem] laptop:w-[initial] laptopL:-right-24">
          <img
            src={
              cloudinary.referralCampaign.genericReferral.purpleEdgeGlowTablet
            }
            alt="Purple glow right edge"
            className="fixed -bottom-4 z-1 w-full laptop:bottom-[unset] laptop:top-0 laptop:h-full laptop:w-auto laptop:-rotate-90"
          />
          <img
            src={cloudinary.referralCampaign.genericReferral.appScreenshot}
            alt="Daily.dev app screenshot of my feed page"
            className="z-0 h-auto w-full object-contain laptop:h-full laptop:max-h-[25.35rem] laptop:w-auto laptopXL:max-h-[39.5rem]"
          />
          <img
            src={cloudinary.referralCampaign.genericReferral.playButton}
            alt="Play daily.dev introduction video"
            className="absolute z-2 h-[7.5rem] tablet:-mt-6 tablet:h-[14.5rem] laptop:mr-[8.5rem] laptop:mt-2 laptop:h-32 laptop:self-center laptopL:m-auto laptopXL:h-auto"
          />
          <button
            className="absolute z-2 h-full w-full"
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
