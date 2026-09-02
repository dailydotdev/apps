import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import { NotificationsFeed } from '../components/notifications/NotificationsFeed';

const seo: NextSeoProps = {
  title: 'Notifications',
  noindex: true,
  nofollow: true,
};

const Notifications = (): ReactElement => <NotificationsFeed />;

const getNotificationsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

Notifications.getLayout = getNotificationsLayout;
Notifications.layoutProps = { seo };

export default Notifications;
