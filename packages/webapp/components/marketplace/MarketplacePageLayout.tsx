import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { marketplaceHeroImage } from '@dailydotdev/shared/src/lib/image';
import {
  ProductHuntBadge,
  ProductHuntBadgeTheme,
} from '@dailydotdev/shared/src/components/marketing/ProductHuntBadge';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featurePlusSale } from '@dailydotdev/shared/src/lib/featureManagement';

interface MarketplacePageLayoutProps {
  children: ReactNode;
  className?: string;
  title: string;
}

export const MarketplacePageLayout = ({
  children,
  className,
  title,
}: MarketplacePageLayoutProps): ReactElement => {
  const { isAuthReady } = useAuthContext();
  const { value: plusSale } = useConditionalFeature({
    feature: featurePlusSale,
    shouldEvaluate: isAuthReady,
  });
  const showProductHuntBadge = /product hunt/i.test(plusSale.headline);

  return (
    <>
      <ShellPage title={title} />
      <div className="relative">
        <div
          role="img"
          aria-label="daily.dev plugin marketplace"
          className="h-48 w-full bg-cover bg-center tablet:h-56"
          style={{ backgroundImage: `url("${marketplaceHeroImage}")` }}
        />
        {true && (
          <ProductHuntBadge
            className="absolute bottom-4 right-4"
            theme={ProductHuntBadgeTheme.Light}
          />
        )}
      </div>
      <PageWrapperLayout
        className={classNames('flex flex-col px-4 py-6', className)}
      >
        {children}
      </PageWrapperLayout>
    </>
  );
};
