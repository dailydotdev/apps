import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import ProfileIndex from '../../components/layouts/SettingsLayout/Profile';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage account profile'),
};

const AccountProfilePage = (): ReactElement => {
  return <ProfileIndex />;
};

AccountProfilePage.getLayout = getSettingsLayout;
AccountProfilePage.layoutProps = { seo };

export default AccountProfilePage;
