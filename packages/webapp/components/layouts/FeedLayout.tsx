import React, { ReactNode } from 'react';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';

export default FeedLayout;

export const getLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps,
): ReactNode =>
  getFooterNavBarLayout(
    <MainLayout {...layoutProps}>
      <FeedLayout>{page}</FeedLayout>
    </MainLayout>,
  );
