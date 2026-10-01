import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { YouPage } from '@dailydotdev/shared/src/components/shell/YouPage';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';

const seo: NextSeoProps = {
  title: 'You',
  noindex: true,
  nofollow: true,
};

const You = (): ReactElement => <YouPage />;

const getYouLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

You.getLayout = getYouLayout;
You.layoutProps = { seo };

export default You;
