import React, { ReactElement, ReactNode, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { getLayout } from '../FeedLayout';
import { MainFeedPageProps } from '../MainFeedPage';
import FeedByIdsLayout from './FeedByIdsLayout';

export default function FeedByIdsPage({
  children,
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);

  useEffect(() => {
    if (tokenRefreshed && (!user || !user?.isTeamMember)) {
      router.replace('/');
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenRefreshed, user]);

  return <FeedByIdsLayout>{children}</FeedByIdsLayout>;
}

export function getFeedByIdsLayout(
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps & MainFeedPageProps,
): ReactNode {
  return getLayout(
    <FeedByIdsPage {...layoutProps}>{page}</FeedByIdsPage>,
    pageProps,
    layoutProps,
  );
}

export const feedbyIdsLayoutProps: MainLayoutProps = {
  mainPage: true,
  screenCentered: false,
};
