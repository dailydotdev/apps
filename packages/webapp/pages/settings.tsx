import React, { ReactElement } from 'react';
import Settings from '@dailydotdev/shared/src/components/Settings';
import { NextSeo } from 'next-seo';
import {
  getLayout,
  mainFooterLayoutProps,
} from '../components/layouts/MainFooterLayout';

const SettingsPage = (): ReactElement => (
  <main className="withNavBar">
    <NextSeo nofollow noindex />
    <Settings />
  </main>
);

SettingsPage.getLayout = getLayout;
SettingsPage.layoutProps = {
  ...mainFooterLayoutProps,
  mobileTitle: 'Customize',
};

export default SettingsPage;
