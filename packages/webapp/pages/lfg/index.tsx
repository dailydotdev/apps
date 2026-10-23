import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { LfgBoard } from '@dailydotdev/shared/src/features/lfg/components/board/LfgBoard';
import { LfgPrelaunchBoard } from '@dailydotdev/shared/src/features/lfg/components/board/LfgPrelaunchBoard';
import { getLfgLayout, LfgGate } from '../../components/lfg/LfgGate';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { noindexSeoProps } from '../../next-seo';

const seo: NextSeoProps = {
  ...getPageSeoTitles('Looking for group'),
  ...noindexSeoProps,
};

const LfgBoardPage = (): ReactElement => (
  <LfgGate>
    {({ isLaunched }) => (isLaunched ? <LfgBoard /> : <LfgPrelaunchBoard />)}
  </LfgGate>
);

LfgBoardPage.getLayout = getLfgLayout;
LfgBoardPage.layoutProps = { seo };

export default LfgBoardPage;
