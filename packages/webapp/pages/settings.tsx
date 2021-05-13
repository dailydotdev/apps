import React, { ReactElement } from 'react';
import { getLayout } from '../components/layouts/FooterNavBarLayout';
import Settings from '@dailydotdev/shared/src/components/Settings';

const SettingsPage = (): ReactElement => (
  <main className="withNavBar">
    <Settings />
  </main>
);

SettingsPage.getLayout = getLayout;

export default SettingsPage;
