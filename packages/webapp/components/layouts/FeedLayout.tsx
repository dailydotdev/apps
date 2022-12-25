import React, { ReactNode } from 'react';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';
import { getLayout as getWebappLayout, WebappLayoutProps } from './MainLayout';

export default FeedLayout;

export const getLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: WebappLayoutProps,
): ReactNode => {
  return getFooterNavBarLayout(
    getWebappLayout(<FeedLayout>{page}</FeedLayout>, pageProps, layoutProps),
  );
};
