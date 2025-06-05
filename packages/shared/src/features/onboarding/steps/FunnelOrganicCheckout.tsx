import type { ReactElement } from 'react';
import React from 'react';
import { PlusDesktop } from '../../../components/plus/PlusDesktop';
import { PlusMobile } from '../../../components/plus/PlusMobile';
import { useViewSize, ViewSize } from '../../../hooks';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import type { FunnelStepOrganicCheckout } from '../types/funnel';

const OrganicCheckout = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  console.log({ isLaptop });
  return (
    <>
      {isLaptop ? (
        <PlusDesktop shouldShowPlusHeader />
      ) : (
        <PlusMobile shouldShowPlusHeader />
      )}
    </>
  );
};

export const FunnelOrganicCheckout =
  withIsActiveGuard<FunnelStepOrganicCheckout>(OrganicCheckout);

export default FunnelOrganicCheckout;
