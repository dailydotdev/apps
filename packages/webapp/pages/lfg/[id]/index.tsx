import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { LfgPostPage } from '@dailydotdev/shared/src/features/lfg/components/post/LfgPostPage';
import { getLfgLayout, LfgGate } from '../../../components/lfg/LfgGate';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { noindexSeoProps } from '../../../next-seo';

const seo: NextSeoProps = {
  ...getPageSeoTitles('Looking for group'),
  ...noindexSeoProps,
};

const LfgPostRoute = (): ReactElement => {
  const { query } = useRouter();
  const id = typeof query.id === 'string' ? query.id : '';

  return (
    <LfgGate>
      {({ isLaunched }) => <LfgPostPage id={id} isLaunched={isLaunched} />}
    </LfgGate>
  );
};

LfgPostRoute.getLayout = getLfgLayout;
LfgPostRoute.layoutProps = { seo, screenCentered: false };

export default LfgPostRoute;
