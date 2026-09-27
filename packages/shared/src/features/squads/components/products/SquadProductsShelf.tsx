import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ArrowIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../../lib/log';
import { webappUrl } from '../../../../lib/constants';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadProducts } from '../../hooks/useSquadProducts';
import { getSquadProductsUrl } from '../../lib/routes';
import { SquadProductLogo } from './SquadProductLogo';

export const getSquadProductUrl = (slug: string): string =>
  `${webappUrl}tools/${slug}`;

export const SquadProductsShelf = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const { logEvent } = useLogContext();
  const { isEnabled, products } = useSquadProducts(squad);

  if (!isEnabled || !products.length) {
    return null;
  }

  const productsUrl = getSquadProductsUrl(squad.handle);

  return (
    <section className="flex flex-col gap-3 border-b border-border-subtlest-tertiary px-4 py-4 tablet:px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-text-primary typo-callout">Products</h2>
        <Link href={productsUrl} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.XSmall}
            icon={<ArrowIcon size={IconSize.Size16} className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
          >
            See all {products.length}
          </Button>
        </Link>
      </div>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 tablet:-mx-6 tablet:px-6">
        {products.map((product) => {
          const href = getSquadProductUrl(product.slug);

          return (
            <li key={product.id} className="w-56 shrink-0">
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
                  className="flex h-full items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-3 hover:border-border-subtlest-secondary"
                >
                  <SquadProductLogo product={product} className="size-10" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-bold text-text-primary typo-callout">
                      {product.title}
                    </span>
                    {!!product.tagline && (
                      <span className="line-clamp-2 text-text-tertiary typo-footnote">
                        {product.tagline}
                      </span>
                    )}
                  </span>
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
