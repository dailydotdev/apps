import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import {
  cloudinaryReferralCampaignGenericReferralBackgroundDark,
  cloudinaryReferralCampaignGenericReferralPurpleEdgeGlowTablet,
  cloudinaryReferralCampaignGenericReferralAppScreenshot,
  cloudinaryReferralCampaignGenericReferralPlayButton,
} from '@dailydotdev/shared/src/lib/image';
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
import type { JoinPageProps } from './common';
import { DailyDevLogo } from './common';

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
        backgroundImage: `url(${cloudinaryReferralCampaignGenericReferralBackgroundDark})`,
      }}
      className="laptop:flex-row laptop:p-6 relative flex h-screen flex-auto flex-col items-center overflow-hidden bg-cover p-2"
    >
      <DailyDevLogo />
      <div className="z-1 laptop:ml-3 laptop:mt-0 laptop:max-w-[25rem] laptop:p-0 laptopL:ml-[9.25rem] laptopL:max-w-[37.25rem] mt-20 flex w-full flex-col p-4">
        <span className="tablet:mb-8 laptop:flex-row laptop:items-start laptopL:gap-6 mb-7 flex flex-col items-center gap-3">
          <ProfileImageLink
            user={referringUser}
            picture={{
              size: isLaptopL
                ? ProfileImageSize.XXXLarge
                : ProfileImageSize.XLarge,
            }}
          />
          <p className="typo-body laptop:text-left laptop:typo-title3 laptopL:typo-title2 my-auto text-center">
            <span className="laptop:inline block">{referringUser.name}</span>
            <span className="font-normal"> invited you to daily.dev</span>
          </p>
        </span>
        <h1 className="break-words-overflow typo-large-title tablet:typo-mega2 laptop:text-left laptopL:typo-giga2 w-full text-center">
          The homepage
          <span className="text-brand-default block font-bold">
            {' '}
            developers deserve
          </span>
        </h1>
        <p className="text-text-tertiary typo-title3 tablet:mt-8 laptop:mx-0 laptop:text-left laptopL:max-w-xl mx-auto mt-7 max-w-sm text-center">
          We know how hard it is to be a developer. It doesn’t have to be.
          Personalized news feed, dev communities and search, much better than
          what’s out there. Maybe 😉
        </p>
        <Button
          size={ButtonSize.Large}
          variant={ButtonVariant.Primary}
          // important has been used is some classnames to override the default styles as agreed on [thread](https://dailydotdev.slack.com/archives/C05P9ET7S9K/p1699023366663489?thread_ts=1699011522.350609&cid=C05P9ET7S9K)
          className="tablet:mt-12 tablet:!h-16 tablet:max-w-fit tablet:!p-0 tablet:!px-6 laptop:mx-0 mx-auto mt-6 max-w-[17.5rem] p-4"
          tag="a"
          href={downloadBrowserExtension}
          onClick={() => {
            handleAcceptClick();
          }}
          rel={anchorDefaultRel}
        >
          <FlexCentered className="tablet:typo-title3 gap-2">
            <BrowsersIcon className="text-text-primary tablet:h-10 tablet:w-20 h-[1.9rem] w-[3.7rem]" />
            Try it now - It&apos;s free
          </FlexCentered>
        </Button>
      </div>
      <div className="laptop:initial laptop:bottom-[unset] fixed -bottom-1/2 flex h-full w-full flex-auto">
        <div className="z-1 laptop:absolute laptop:right-[-7.5rem] laptop:w-[initial] laptopL:-right-24 relative m-auto mx-2 flex w-fit justify-center self-center">
          <img
            src={cloudinaryReferralCampaignGenericReferralPurpleEdgeGlowTablet}
            alt="Purple glow right edge"
            className="z-1 laptop:bottom-[unset] laptop:top-0 laptop:h-full laptop:w-auto laptop:-rotate-90 fixed -bottom-4 w-full"
          />
          <img
            src={cloudinaryReferralCampaignGenericReferralAppScreenshot}
            alt="Daily.dev app screenshot of For You page"
            className="laptop:h-full laptop:max-h-[25.35rem] laptop:w-auto laptopXL:max-h-[39.5rem] z-0 h-auto w-full object-contain"
          />
          <img
            src={cloudinaryReferralCampaignGenericReferralPlayButton}
            alt="Play daily.dev introduction video"
            className="z-2 tablet:-mt-6 tablet:h-[14.5rem] laptop:mr-[8.5rem] laptop:mt-2 laptop:h-32 laptop:self-center laptopL:m-auto laptopXL:h-auto absolute h-[7.5rem]"
          />
          <button
            className="z-2 absolute h-full w-full"
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
