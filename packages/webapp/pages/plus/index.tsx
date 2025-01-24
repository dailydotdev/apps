import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';

import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { getUserShortInfo } from '@dailydotdev/shared/src/graphql/users';
import type { PlusPageProps } from '@dailydotdev/shared/src/components/plus/common';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
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

const PlusPage = ({ giftUser }: PlusPageProps): ReactElement => {
  const [isGiftingUi, setIsGiftingUi] = useState(!!giftUser);
  const [userToGift, setUserToGift] = useState(giftUser);
  const { isReady } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const onUserChange = useCallback((user: UserShortProfile) => {
    setIsGiftingUi(true);
    setUserToGift(user);
  }, []);

  const pageProps: PlusPageProps = {
    giftUser: userToGift,
    onUserChange,
    isGiftingUi,
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

export const getServerSideProps: GetServerSideProps<
  Pick<PlusPageProps, 'giftUser'>
> = async ({ query }) => {
  const validateUserId = (value: string) => !!value && value !== '404';
  const giftUserId = query?.giftUserId as string;

  if (!validateUserId(giftUserId)) {
    return { props: {} };
  }

  try {
    const giftUser = await getUserShortInfo(giftUserId);

    return { props: { giftUser } };
  } catch (err) {
    return {
      props: {},
    };
  }
};

export default PlusPage;
