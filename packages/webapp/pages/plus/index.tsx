import type { ReactElement } from 'react';
import React from 'react';

import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import type { GiftUserContextData } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
import { GiftUserContext } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
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

const seo: NextSeoProps = {
  title: getTemplatedTitle('Unlock Premium Developer Features with Plus'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Upgrade to daily.dev Plus for an ad-free experience, custom feeds, bookmark folders, clickbait shield, and more.',
};

export type PlusPageProps = Pick<GiftUserContextData, 'giftToUser'>;

const PlusPage = ({ giftToUser }: PlusPageProps): ReactElement => {
  const { isReady } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isReady) {
    return null;
  }

  return (
    <GiftUserContext.Provider value={{ giftToUser }}>
      {isLaptop ? <PlusDesktop /> : <PlusMobile />}
    </GiftUserContext.Provider>
  );
};

PlusPage.getLayout = getPlusLayout;
PlusPage.layoutProps = { seo };

export default PlusPage;
