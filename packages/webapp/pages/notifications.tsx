import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureNotificationsRedesign } from '@dailydotdev/shared/src/lib/featureManagement';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import { NotificationsLegacy } from '../components/notifications/NotificationsLegacy';
import { NotificationsFeed } from '../components/notifications/NotificationsFeed';

const seo: NextSeoProps = {
  title: 'Notifications',
  noindex: true,
  nofollow: true,
};

const Notifications = (): ReactElement => {
  const { isAuthReady } = useAuthContext();
  // Default to the control until the flag resolves — never block the whole
  // page on GrowthBook readiness. Enrolled users swap to the redesign once the
  // value reads true (one extra mount, but no blank page if features are slow).
  const { value } = useConditionalFeature({
    feature: featureNotificationsRedesign,
    shouldEvaluate: isAuthReady,
  });
  // `isDevelopment` is a local-only preview so the redesign shows on localhost
  // without touching GrowthBook; it's false on prod/preview builds, so the
  // committed default stays `false` and the experiment still ramps via the flag.
  const isRedesign = value || isDevelopment;

  return isRedesign ? <NotificationsFeed /> : <NotificationsLegacy />;
};

const getNotificationsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

Notifications.getLayout = getNotificationsLayout;
Notifications.layoutProps = { seo };

export default Notifications;
