import React, { ReactNode } from 'react';
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
): ReactNode =>
  getFooterNavBarLayout(
    <MainLayout {...layoutProps}>
      <FeedLayout>{page}</FeedLayout>
    </MainLayout>,
  );
