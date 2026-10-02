import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { MobileFeedActions } from '@dailydotdev/shared/src/components/feeds/MobileFeedActions';
import { marketplaceHeroImage } from '@dailydotdev/shared/src/lib/image';
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
    <div
      role="img"
      aria-label="daily.dev plugin marketplace"
      className="h-48 w-full bg-cover bg-center tablet:h-56"
      style={{ backgroundImage: `url("${marketplaceHeroImage}")` }}
    />
    <PageWrapperLayout
      className={classNames('flex flex-col px-4 py-6', className)}
    >
      {children}
    </PageWrapperLayout>
  </MarketplaceFeatureGate>
);
