import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { marketplaceHeroImage } from '@dailydotdev/shared/src/lib/image';
import { GitHubStarBadge } from '@dailydotdev/shared/src/components/marketing/GitHubStarBadge';

interface MarketplacePageLayoutProps {
  children: ReactNode;
  className?: string;
  title: string;
}

export const MarketplacePageLayout = ({
  children,
  className,
  title,
}: MarketplacePageLayoutProps): ReactElement => (
  <>
    <ShellPage title={title} />
    <div className="relative">
      <div
        role="img"
        aria-label="daily.dev plugin marketplace"
        className="h-48 w-full bg-cover bg-center tablet:h-56"
        style={{ backgroundImage: `url("${marketplaceHeroImage}")` }}
      />
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3">
        <GitHubStarBadge repository="dailydotdev/marketplace" />
      </div>
    </div>
    <PageWrapperLayout
      className={classNames('flex flex-col px-4 py-6', className)}
    >
      {children}
    </PageWrapperLayout>
  </>
);
