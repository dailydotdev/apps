import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { getLayout } from '../../components/layouts/MainLayout';
import { GoogleCloudTakeover } from '../../components/demo/googleCloud/GoogleCloudTakeover';

const GoogleCloudDemoPage = (): ReactElement => (
  <>
    <NextSeo nofollow noindex title="Google Cloud · advertiser preview" />
    <GoogleCloudTakeover />
  </>
);

GoogleCloudDemoPage.getLayout = getLayout;
GoogleCloudDemoPage.layoutProps = { screenCentered: false };

export default GoogleCloudDemoPage;
