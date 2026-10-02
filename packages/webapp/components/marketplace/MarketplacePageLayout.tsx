import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
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
    <PageWrapperLayout
      className={classNames('flex flex-col px-4 py-6', className)}
    >
      {children}
    </PageWrapperLayout>
  </MarketplaceFeatureGate>
);
