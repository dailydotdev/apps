import type { ReactElement } from 'react';
import React, { useState } from 'react';

import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { getUserShortInfo } from '@dailydotdev/shared/src/graphql/users';
import type { GiftUserContextData } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
import { GiftUserContext } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';

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

type PlusPageProps = Pick<GiftUserContextData, 'giftingUser'>;

const PlusPage = ({ giftingUser }: PlusPageProps): ReactElement => {
  const [userToGift, setUserToGift] = useState(giftingUser);
  const { isReady } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const pageProps: GiftUserContextData = {
    giftingUser: userToGift,
    onUserChange: setUserToGift,
  };

  if (!isReady) {
    return null;
  }

  if (isLaptop) {
    return (
      <GiftUserContext.Provider value={pageProps}>
        <PlusDesktop />
      </GiftUserContext.Provider>
    );
  }

  return (
    <GiftUserContext.Provider value={pageProps}>
      <PlusMobile />
    </GiftUserContext.Provider>
  );
};

PlusPage.getLayout = getPlusLayout;

export const getServerSideProps: GetServerSideProps<PlusPageProps> = async ({
  query,
}) => {
  const validateUserId = (value: string) => !!value && value !== '404';
  const giftUserId = query?.giftUserId as string;

  if (!validateUserId(giftUserId)) {
    return { props: {} };
  }

  try {
    const giftingUser = await getUserShortInfo(giftUserId);

    if (giftingUser.isPlus) {
      return { props: {} };
    }

    return { props: { giftingUser } };
  } catch (err) {
    return {
      props: {},
    };
  }
};

export default PlusPage;
