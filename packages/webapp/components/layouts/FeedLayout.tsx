import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';
import FeedLayout, {
  FeedLayoutProps,
} from '@dailydotdev/shared/src/components/FeedLayout';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';

export default FeedLayout;

export const getLayout = (
  page: ReactNode,
  pageProps: FeedLayoutProps,
  layoutProps: MainLayoutProps,
): ReactNode => {
  const router = useRouter();
  return getFooterNavBarLayout(
    <MainLayout {...layoutProps} activePage={router?.asPath}>
      <FeedLayout {...pageProps}>{page}</FeedLayout>
    </MainLayout>,
  );
};
