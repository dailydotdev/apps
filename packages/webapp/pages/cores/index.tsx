import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { defaultOpenGraph } from '../../next-seo';
import { getCoresLayout } from '../../components/layouts/CoresLayout';

const seo: NextSeoProps = {
  title: getTemplatedTitle('TODO: Buy cores title'),
  openGraph: { ...defaultOpenGraph },
  description: 'TODO: Buy cores description',
};

const CoresPage = (): ReactElement => {
  return <p>buy cores here</p>;
};

CoresPage.getLayout = getCoresLayout;
CoresPage.layoutProps = { seo };

export default CoresPage;
