import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';

export default MainLayout;

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => {
  const router = useRouter();
  return getFooterNavBarLayout(
    <MainLayout {...layoutProps} activePage={router?.asPath}>
      {page}
    </MainLayout>,
  );
};

export const mainFooterLayoutProps: MainLayoutProps = {
  greeting: true,
  mainPage: true,
};
