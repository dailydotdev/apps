import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';
import { NextSeo, NextSeoProps } from 'next-seo';

export default MainLayout;

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  { seo, ...layoutProps }: MainLayoutProps & { seo?: NextSeoProps } = {},
): ReactNode => {
  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  return (
    <>
      {seo && <NextSeo {...seo} />}
      <MainLayout {...layoutProps} activePage={router?.asPath}>
        {page}
      </MainLayout>
    </>
  );
};
