import React, { ReactElement } from 'react';
import { NextSeo } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';

const Notifications = (): ReactElement => {
  const seo = <NextSeo title="Notifications" nofollow noindex />;

  return (
    <ProtectedPage seo={seo}>
      <ResponsivePageContainer>Notifs</ResponsivePageContainer>
    </ProtectedPage>
  );
};

Notifications.getLayout = getLayout;

export default Notifications;
