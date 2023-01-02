import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import MainLayout, {
  MainLayoutProps,
} from '@dailydotdev/shared/src/components/MainLayout';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { NextSeo, NextSeoProps } from 'next-seo';
import { getUnreadTitle } from '@dailydotdev/shared/src/components/notifications/utils';

export default MainLayout;

export interface WebappLayoutProps extends MainLayoutProps {
  seo?: NextSeoProps;
}

export const getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  { seo, ...layoutProps }: WebappLayoutProps = {},
): ReactNode => {
  const router = useRouter();
  const { unreadCount } = useNotificationContext();
  return (
    <MainLayout {...layoutProps} activePage={router?.asPath}>
      {seo && (
        <NextSeo {...seo} title={getUnreadTitle(unreadCount, seo.title)} />
      )}
      {page}
    </MainLayout>
  );
};
