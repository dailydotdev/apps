import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';

export default FeedLayout;

export const getLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps,
): ReactNode => {
  const router = useRouter();
  return getFooterNavBarLayout(
    <MainLayout {...layoutProps} activePage={router?.asPath}>
      <FeedLayout>{page}</FeedLayout>
    </MainLayout>,
  );
};
