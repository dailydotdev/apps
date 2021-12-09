import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';

export default MainLayout;

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => {
  const router = useRouter();
  return (
    <MainLayout {...layoutProps} activePage={router?.asPath}>
      {page}
    </MainLayout>
  );
};
