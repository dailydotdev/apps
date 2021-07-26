import React, { ReactElement } from 'react';
import Settings from '@dailydotdev/shared/src/components/Settings';
import { getLayout } from '../components/layouts/FooterNavBarLayout';

const SettingsPage = (): ReactElement => (
  <main className="withNavBar">
    <Settings />
  </main>
);

SettingsPage.getLayout = getLayout;

export default SettingsPage;
