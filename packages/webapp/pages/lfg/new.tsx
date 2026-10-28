import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { LfgComposer } from '@dailydotdev/shared/src/features/lfg/components/composer/LfgComposer';
import { getLfgLayout, LfgGate } from '../../components/lfg/LfgGate';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { noindexSeoProps } from '../../next-seo';

const seo: NextSeoProps = {
  ...getPageSeoTitles('New post · Looking for group'),
  ...noindexSeoProps,
};

const NewLfgPostPage = (): ReactElement => (
  <LfgGate>
    <LfgComposer />
  </LfgGate>
);

NewLfgPostPage.getLayout = getLfgLayout;
NewLfgPostPage.layoutProps = { seo };

export default NewLfgPostPage;
