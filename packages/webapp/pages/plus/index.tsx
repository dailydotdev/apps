import type { ReactElement } from 'react';
import React, { useState } from 'react';

import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { getUserShortInfo } from '@dailydotdev/shared/src/graphql/users';
import type { GiftUserContextData } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
import { GiftUserContext } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { defaultOpenGraph } from '../../next-seo';

const PlusMobile = dynamic(() =>
  import(
    /* webpackChunkName: "plusMobile" */ '@dailydotdev/shared/src/components/plus/PlusMobile'
  ).then((mod) => mod.PlusMobile),
);
const PlusDesktop = dynamic(() =>
  import(
    /* webpackChunkName: "plusDesktop" */ '@dailydotdev/shared/src/components/plus/PlusDesktop'
  ).then((mod) => mod.PlusDesktop),
);

type PlusPageProps = Pick<GiftUserContextData, 'giftToUser'>;

const seo: NextSeoProps = {
  title: getTemplatedTitle('Unlock Premium Developer Features with Plus'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Upgrade to daily.dev Plus for an ad-free experience, custom feeds, bookmark folders, clickbait shield, and more.',
};

const PlusPage = ({ giftToUser }: PlusPageProps): ReactElement => {
  const [userToGift, setUserToGift] = useState(giftToUser);
  const { isReady } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isReady) {
    return null;
  }

  return (
    <GiftUserContext.Provider
      value={{
        giftToUser: userToGift,
        onUserChange: setUserToGift,
      }}
    >
      {isLaptop ? <PlusDesktop /> : <PlusMobile />}
    </GiftUserContext.Provider>
  );
};

PlusPage.getLayout = getPlusLayout;
PlusPage.layoutProps = { seo };

export const getServerSideProps: GetServerSideProps<PlusPageProps> = async ({
  query,
}) => {
  const validateUserId = (value: string) => !!value && value !== '404';
  const giftToUserId = query?.giftToUserId as string;

  if (!validateUserId(giftToUserId)) {
    return { props: {} };
  }

  try {
    const giftToUser = await getUserShortInfo(giftToUserId);

    if (giftToUser.isPlus) {
      return { props: {} };
    }

    return { props: { giftToUser } };
  } catch (err) {
    return {
      props: {},
    };
  }
};

export default PlusPage;
