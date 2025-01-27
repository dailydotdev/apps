import type { ReactElement } from 'react';
import React from 'react';

import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getUserShortInfo } from '@dailydotdev/shared/src/graphql/users';
import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { EmptyObjectLiteral } from '@dailydotdev/shared/src/lib/kratos';
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

const PlusPage = (): ReactElement => {
  const { isReady } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isReady) {
    return null;
  }

  if (isLaptop) {
    return <PlusDesktop />;
  }

  return <PlusMobile />;
};

PlusPage.getLayout = getPlusLayout;
PlusPage.layoutProps = { seo };

interface PageProps extends ParsedUrlQuery {
  giftToUserId: string;
}

export const getStaticProps = async ({
  params,
}: GetStaticPropsContext<PageProps>): Promise<
  GetStaticPropsResult<EmptyObjectLiteral>
> => {
  const validateUserId = (value: string) => !!value && value !== '404';
  const giftToUserId = params?.giftToUserId;

  if (!validateUserId(giftToUserId)) {
    return { props: {} };
  }

  try {
    const giftToUser = await getUserShortInfo(giftToUserId);

    if (giftToUser.isPlus) {
      return { props: {} };
    }

    return {
      redirect: { destination: `/plus/gift/${giftToUserId}`, permanent: false },
    };
  } catch (err) {
    return { props: {} };
  }
};

export default PlusPage;
