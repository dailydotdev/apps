import React, { ReactElement } from 'react';
import { NextSeo } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { getLayout } from '../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import ProtectedPage from '../components/ProtectedPage';

const Notifications = (): ReactElement => {
  const seo = <NextSeo title="Notifications" nofollow noindex />;

  return (
    <ProtectedPage seo={seo}>
      <ResponsivePageContainer>Notifs</ResponsivePageContainer>
    </ProtectedPage>
  );
};

const getNotificationsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

Notifications.getLayout = getNotificationsLayout;

export default Notifications;
