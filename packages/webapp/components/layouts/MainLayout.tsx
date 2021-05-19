import React, { ReactNode } from 'react';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';

export default MainLayout;

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => <MainLayout {...layoutProps}>{page}</MainLayout>;
