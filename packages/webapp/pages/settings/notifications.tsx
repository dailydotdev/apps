import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import NotificationsForm from '@dailydotdev/shared/src/components/notifications/NotificationsForm';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';

import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage account notifications'),
};

const AccountNotificationsPage = (): ReactElement => {
  return <NotificationsForm />;
};

AccountNotificationsPage.getLayout = getSettingsLayout;
AccountNotificationsPage.layoutProps = { seo };

export default AccountNotificationsPage;
