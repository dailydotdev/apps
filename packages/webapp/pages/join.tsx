import Logo from '@dailydotdev/shared/src/components/Logo';
import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  FlexCentered,
  FlexCol,
  FlexRow,
} from '@dailydotdev/shared/src/components/utilities';
import { GET_REFERRING_USER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import {
  downloadBrowserExtension,
  isDevelopment,
} from '@dailydotdev/shared/src/lib/constants';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import request from 'graphql-request';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import BrowsersIcon from '@dailydotdev/shared/icons/browsers.svg';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import PlayIcon from '@dailydotdev/shared/src/components/icons/Play';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  ModalKind,
  ModalSize,
} from '@dailydotdev/shared/src/components/modals/common/types';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useMedia from '@dailydotdev/shared/src/hooks/useMedia';
import { laptop } from '@dailydotdev/shared/src/styles/media';
import { GetServerSideProps } from 'next';

type PageProps = {
  referringUser: Pick<PublicProfile, 'id' | 'name' | 'image'>;
  campaign: ReferralCampaignKey;
};

const Page = ({ referringUser, campaign }: PageProps): ReactElement => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [isVideoOpen, setVideoOpen] = useState(false);
  const isDesktop = useMedia([laptop.replace('@media ', '')], [true], false);

  const onVideoModalClose = () => {
    setVideoOpen(false);
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    router.replace('/');
  }, [user?.id, router]);

  useEffect(() => {
    document.cookie = [
      `join_referral=${referringUser.id}:${campaign}`,
      `max-age=${1 * 365 * 24 * 60 * 60}`,
      isDevelopment ? undefined : 'Secure',
      `domain=${process.env.NEXT_PUBLIC_DOMAIN}`,
    ]
      .filter(Boolean)
      .join('; ');
  }, [campaign, referringUser.id]);

  return (
    <div
      style={{
        backgroundImage: `url(${cloudinary.referralCampaign.backgroundDark})`,
      }}
      className="flex overflow-x-hidden flex-col p-8 laptop:pr-0 pb-0 laptop:pb-8 bg-pepper-80 bg-cover min-h-[100vh]"
    >
      <Logo
        className="mx-auto laptop:mx-0 mb-8 laptop:mb-16 h-6"
        logoClassName="h-6"
      />
      {!!referringUser && (
        <div className="flex flex-col laptop:flex-row flex-1 gap-8 justify-between items-center">
          <FlexCol className="flex-1 items-center laptop:items-start laptop:mr-8 laptopXL:ml-24 max-w-[37.5rem] laptop:min-w-[28rem]">
            <FlexRow className="flex-col laptop:flex-row items-center mb-4 laptop:mb-10">
              <ProfilePicture
                className="mr-6 mb-4 laptop:mb-0"
                user={referringUser}
                size={isDesktop ? 'xxxlarge' : 'xlarge'}
              />
              <p className="flex-1 text-center laptop:text-left text-white laptopL:typo-title2 laptop:typo-title3 typo-body">
                <b>{referringUser.name}</b> invites you to use daily.dev
              </p>
            </FlexRow>
            <h1 className="mb-4 text-center laptop:text-left text-white laptop:typo-mega1 laptopL:typo-giga2 typo-large-title">
              The Homepage
              <br />
              <b className="text-cabbage-40">Developers Deserve</b>
            </h1>
            <p className="mb-10 text-center laptop:text-left text-salt-90 !font-normal laptop:typo-title2 typo-headline">
              Get one personalized feed for all the knowledge you need. Make
              learning a daily habit or just do something useful while
              you&apos;re in endless meetings&nbsp;😜
            </p>
            <Button
              className="max-w-sm h-11 laptop:h-16 btn-primary laptop:!typo-title3"
              tag="a"
              href={downloadBrowserExtension}
              target="_blank"
              buttonSize={ButtonSize.XLarge}
            >
              <FlexCentered className="gap-2">
                <BrowsersIcon
                  width="50px"
                  height="23px"
                  className="text-theme-label-primary"
                />
                Add to browser - it&apos;s free!
              </FlexCentered>
            </Button>
          </FlexCol>
          <FlexCol className="relative mt-8 laptop:mt-0">
            <button
              className="-mx-8"
              type="button"
              onClick={() => {
                setVideoOpen(true);
              }}
            >
              <Image
                className="object-contain w-full laptopL:max-w-[1015px] laptopL:height-[633px] laptop:max-w-[650px] height-[405px]"
                src={cloudinary.referralCampaign.appScreenshot}
                alt="Image showing the daily.dev"
              />
              <PlayIcon
                style={{
                  boxShadow: '0px 3px 43px rgba(206,60,243, 1)',
                }}
                className="absolute top-1 laptop:top-1/2 left-1/2 z-1 h-20 laptop:h-28 bg-pepper-90 rounded-full transform -translate-x-1/2 -translate-y-1/2 !w-20 laptop:!w-28"
                size={IconSize.XXXLarge}
                secondary
              />
            </button>
          </FlexCol>
        </div>
      )}
      {isVideoOpen && (
        <Modal
          // eslint-disable-next-line @dailydotdev/daily-dev-eslint-rules/no-custom-color
          className="px-8 bg-[black]"
          kind={ModalKind.FlexibleCenter}
          size={ModalSize.XLarge}
          isOpen={isVideoOpen}
          onRequestClose={onVideoModalClose}
        >
          <CloseButton
            buttonSize={ButtonSize.Small}
            className="top-3 right-3 text-white border-white !absolute !btn-secondary"
            onClick={onVideoModalClose}
          />
          <iframe
            className="w-full border-none aspect-video"
            src="https://www.youtube.com/embed/igZCEr3HwCg"
            title="YouTube video player"
            allow="encrypted-media;web-share"
            allowFullScreen
          />
        </Modal>
      )}
      <div
        style={{
          backgroundImage: `url(${cloudinary.referralCampaign.purpleEdgeGlow})`,
        }}
        className="hidden laptop:block absolute top-0 right-0 pointer-events-none h-[100vh] w-[29.375rem]"
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
  const validateUserId = (value: string) => !!value && value !== '404';

  const { userid: userId, cid } = query;
  const campaign = Object.values(ReferralCampaignKey).find(
    (item) => item === cid,
  );

  if (!validateUserId(userId as string) || !campaign) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const result = await request<{ user: PageProps['referringUser'] }>(
    graphqlUrl,
    GET_REFERRING_USER_QUERY,
    {
      id: userId,
    },
  );

  if (result) {
    res.setHeader(
      'Set-Cookie',
      [
        `join_referral=${userId}:${campaign}`,
        `max-age=${1 * 365 * 24 * 60 * 60}`,
        isDevelopment ? undefined : 'Secure',
        `domain=${process.env.NEXT_PUBLIC_DOMAIN}`,
      ]
        .filter(Boolean)
        .join('; '),
    );
  }

  res.setHeader(
    'Cache-Control',
    `public, max-age=0, must-revalidate, s-maxage=${60}`,
  );

  return {
    props: {
      referringUser: result.user,
      campaign,
    },
  };
};

export default Page;
