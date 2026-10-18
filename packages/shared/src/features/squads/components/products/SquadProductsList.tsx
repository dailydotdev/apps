import type { ReactElement } from 'react';
import React from 'react';
import { OpenLinkIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../../lib/log';
import { squadProductPricingLabel } from '../../../../graphql/squadProducts';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadProducts } from '../../hooks/useSquadProducts';
import { getDisplayUrl } from '../../lib/links';
import { SquadProductLogo } from './SquadProductLogo';
import { getSquadProductUrl } from './SquadProductsShelf';

// Product links are the company's own promotion, so unlike the Links widget
// they keep nofollow.
const productLinkRel = 'noopener nofollow';

const Chip = ({ children }: { children: string }): ReactElement => (
  <span className="rounded-6 bg-surface-float px-1.5 py-0.5">{children}</span>
);

export const SquadProductsList = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { logEvent } = useLogContext();
  const { products, isPending } = useSquadProducts(squad);

  if (!isPending && !products.length) {
    return (
      <p className="px-4 py-12 text-center text-text-tertiary typo-callout tablet:px-6">
        No products listed yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 tablet:px-6">
      <p className="text-text-secondary typo-callout">
        Everything {squad.name} makes.
      </p>
      <ol className="flex flex-col gap-6">
        {products.map((product) => {
          const href = getSquadProductUrl(product.slug);

          return (
            <li key={product.id} className="flex items-start gap-4">
              <SquadProductLogo product={product} className="size-12" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link href={href} passHref>
                  <a
                    href={href}
                    onClick={() =>
                      logEvent({
                        event_name: LogEvent.ClickSquadProduct,
                        target_id: product.id,
                        extra: JSON.stringify({
                          squad: squad.id,
                          origin: Origin.SquadPage,
                        }),
                      })
                    }
                    className="font-bold text-text-primary typo-callout hover:underline"
                  >
                    {product.title}
                  </a>
                </Link>
                {!!product.tagline && (
                  <span className="text-text-secondary typo-footnote">
                    {product.tagline}
                  </span>
                )}
                {!!product.description && (
                  <p className="text-text-tertiary typo-footnote">
                    {product.description}
                  </p>
                )}
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-text-tertiary typo-caption1">
                  {!!product.category && <Chip>{product.category}</Chip>}
                  {!!product.pricingModel && (
                    <Chip>
                      {squadProductPricingLabel[product.pricingModel]}
                    </Chip>
                  )}
                  {product.links.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel={productLinkRel}
                      className="flex items-center gap-1 hover:text-text-primary"
                    >
                      <OpenLinkIcon size={IconSize.XSmall} />
                      {getDisplayUrl(url)}
                    </a>
                  ))}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
