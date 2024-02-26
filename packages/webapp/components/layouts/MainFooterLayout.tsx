import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';
import { getLayout as getFooterNavBarLayout } from './FooterNavBarLayout';

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => {
  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  return getFooterNavBarLayout(
    <MainLayout {...layoutProps} activePage={router?.asPath}>
      {page}
    </MainLayout>,
  );
};

export const mainFooterLayoutProps: MainLayoutProps = {
  mainPage: true,
};
