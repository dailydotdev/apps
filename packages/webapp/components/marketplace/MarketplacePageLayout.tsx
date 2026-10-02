import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { MobileFeedActions } from '@dailydotdev/shared/src/components/feeds/MobileFeedActions';
import { MarketplaceFeatureGate } from './MarketplaceFeatureGate';

interface MarketplacePageLayoutProps {
  children: ReactNode;
  className?: string;
}

export const MarketplacePageLayout = ({
  children,
  className,
}: MarketplacePageLayoutProps): ReactElement => (
  <MarketplaceFeatureGate>
    <div className="tablet:hidden">
      <MobileFeedActions />
    </div>
    <PageWrapperLayout
      className={classNames('flex flex-col px-4 py-6', className)}
    >
      {children}
    </PageWrapperLayout>
  </MarketplaceFeatureGate>
);
