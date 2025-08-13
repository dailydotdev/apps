import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const JobsWelcomePage = (): ReactElement => {
  return (
    <div className="mx-auto max-w-[30rem]">
      <p>Welcome to the jobs page</p>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

JobsWelcomePage.getLayout = getPageLayout;
JobsWelcomePage.layoutProps = {
  screenCentered: true,
  seo,
};

export default JobsWelcomePage;
