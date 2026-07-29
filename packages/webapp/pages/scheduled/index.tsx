import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { ScheduledPostList } from '@dailydotdev/shared/src/components/post/schedule/ScheduledPostList';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';

const ScheduledPostsPage = (): ReactElement | null => {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  return (
    <ProtectedPage>
      <ResponsivePageContainer className="relative !p-0" role="main">
        <ScheduledPostList />
      </ResponsivePageContainer>
    </ProtectedPage>
  );
};

const getScheduledLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  title: 'Scheduled posts',
  nofollow: true,
  noindex: true,
};

ScheduledPostsPage.getLayout = getScheduledLayout;
ScheduledPostsPage.layoutProps = { seo };

export default ScheduledPostsPage;
