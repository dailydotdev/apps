import React, { ReactElement } from 'react';
import Settings from '@dailydotdev/shared/src/components/Settings';
import { NextSeo } from 'next-seo';
import { getLayout } from '../components/layouts/FooterNavBarLayout';

const SettingsPage = (): ReactElement => (
  <main className="withNavBar">
    <NextSeo nofollow noindex />
    <Settings />
  </main>
);

SettingsPage.getLayout = getLayout;

export default SettingsPage;
