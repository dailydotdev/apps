import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getLayout } from '../../components/layouts/NoSidebarLayout';

const seo: NextSeoProps = {
  title: 'test',
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

JobsWelcomePage.getLayout = getLayout;
JobsWelcomePage.layoutProps = { screenCentered: true, seo };

export default JobsWelcomePage;
