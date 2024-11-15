import React, { ReactElement } from 'react';

import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';

const PlusMobile = dynamic(() =>
  import(
    /* webpackChunkName: "plusMobile" */ '@dailydotdev/shared/src/components/plus/PlusMobile'
  ).then((mod) => mod.PlusMobile),
);
const PlusDesktop = dynamic(() =>
  import(
    /* webpackChunkName: "plusDesktop" */ '@dailydotdev/shared/src/components/plus/PlusDesktop'
  ).then((mod) => mod.PlusDesktop),
);

const PlusPage = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (isLaptop) {
    return <PlusDesktop />;
  }

  return <PlusMobile />;
};

PlusPage.getLayout = getPlusLayout;

export default PlusPage;
