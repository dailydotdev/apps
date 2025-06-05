import type { ReactElement } from 'react';
import React from 'react';
import { PlusDesktop } from '../../../components/plus/PlusDesktop';
import { PlusMobile } from '../../../components/plus/PlusMobile';
import { useViewSize, ViewSize } from '../../../hooks';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import type { FunnelStepOrganicCheckout } from '../types/funnel';

const OrganicCheckout = (props: FunnelStepOrganicCheckout): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  return (
    <>
      {isLaptop ? (
        <PlusDesktop shouldShowPlusHeader={false} />
      ) : (
        <PlusMobile shouldShowPlusHeader={false} />
      )}
    </>
  );
};

export const FunnelOrganicCheckout = withIsActiveGuard(OrganicCheckout);

export default FunnelOrganicCheckout;
