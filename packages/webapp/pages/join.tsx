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
import { GetServerSideProps } from 'next';
import React, { ReactElement } from 'react';
import BrowsersIcon from '@dailydotdev/shared/icons/browsers.svg';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';

type PageProps = {
  referringUser: Pick<PublicProfile, 'id' | 'name' | 'image'>;
};

const Page = ({ referringUser }: PageProps): ReactElement => {
  return (
    <div className="flex p-8 pr-0 h-[100vh]">
      <Logo className="h-6" logoClassName="h-6" />
      <FlexRow className="flex-1 gap-16 justify-between items-center">
        <FlexCol className="max-w-[37.5rem]">
          <FlexRow className="items-center mb-10">
            <ProfilePicture
              className="mr-6"
              user={referringUser}
              size="xxxlarge"
            />
            <p className="text-white typo-title2">
              <b>{referringUser.name}</b> invites you to use daily.dev
            </p>
          </FlexRow>
          <h1 className="mb-4 text-white typo-giga2">
            The Homepage
            <br />
            <b className="text-cabbage-40">Developers Deserve</b>
          </h1>
          <p className="mb-10 text-salt-90 typo-title2">
            Get one personalized feed for all the knowledge you need. Make
            learning a daily habit or just do something useful while you&apos;re
            in endless meetings 😜
          </p>
          <Button
            className="max-w-sm h-16 btn-primary !typo-title3"
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
        <FlexCol>
          <Image
            src={cloudinary.referralCampaign.appScreenshot}
            alt="Image showing the daily.dev app"
            width={1015}
            height={633}
          />
        </FlexCol>
      </FlexRow>
    </div>
  );
};

const validateUserId = (value: string) => !!value && value !== '404';

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
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

  return {
    props: {
      referringUser: result.user,
    },
  };
};

export default Page;
