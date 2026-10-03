import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { marketplaceHeroImage } from '@dailydotdev/shared/src/lib/image';
import { MarketplaceFeatureGate } from './MarketplaceFeatureGate';

interface MarketplacePageLayoutProps {
  children: ReactNode;
  className?: string;
  // The page name the phone block shows beside its back button.
  title: string;
}

export const MarketplacePageLayout = ({
  children,
  className,
  title,
}: MarketplacePageLayoutProps): ReactElement => (
  <MarketplaceFeatureGate>
    <ShellPage title={title} />
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
