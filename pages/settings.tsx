import React, { ReactElement } from 'react';
import { getLayout } from '../components/layouts/FooterNavBarLayout';
import Settings from '../components/Settings';

const SettingsPage = (): ReactElement => <Settings />;

SettingsPage.getLayout = getLayout;

export default SettingsPage;
