import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { getUnreadTitle } from '@dailydotdev/shared/src/components/notifications/utils';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Popular posts on daily.dev',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Popular = (): ReactElement => {
  const { unreadCount } = useNotificationContext();

  return (
    <>
      <NextSeo {...seo} title={getUnreadTitle(unreadCount, seo.title)} />
    </>
  );
};

Popular.getLayout = getMainFeedLayout;
Popular.layoutProps = mainFeedLayoutProps;

export default Popular;
