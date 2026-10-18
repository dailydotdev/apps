import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SquadProduct } from '../../../../graphql/squadProducts';
import { ToolLogo } from '../../../../components/tools/ToolLogo';

export const SquadProductLogo = ({
  product,
  className,
}: {
  product: Pick<SquadProduct, 'title' | 'faviconUrl' | 'url'>;
  className?: string;
}): ReactElement => (
  <ToolLogo
    title={product.title}
    faviconUrl={product.faviconUrl}
    url={product.url}
    className={classNames('shrink-0 rounded-12 typo-callout', className)}
  />
);
