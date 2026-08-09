import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { Deal } from '../types';
import { formatUsd, getDealCategorySummaries } from '../dealsFormat';
import { DealBrandLogo, DealBrandTileSize } from './DealBrandLogo';

interface DealsCategoryGridProps {
  deals: Deal[];
  className?: string;
}

export const DealsCategoryGrid = ({
  deals,
  className,
}: DealsCategoryGridProps): ReactElement => {
  const summaries = useMemo(() => getDealCategorySummaries(deals), [deals]);

  return (
    <nav
      aria-label="Browse deals by category"
      className={classNames('flex flex-col gap-4', className)}
    >
      <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
        Browse by category
      </Typography>

      <ul className="grid grid-cols-2 gap-3 tablet:grid-cols-3 laptop:grid-cols-4">
        {summaries.map(({ category, path, count, brands, topSavingsUsd }) => (
          <li key={category} className="flex">
            <Link href={path} passHref>
              <a className="flex flex-1 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover">
                <span className="flex flex-row items-center gap-1">
                  {brands.map((brand) => (
                    <DealBrandLogo
                      key={brand.id}
                      brand={brand}
                      size={DealBrandTileSize.Badge}
                    />
                  ))}
                </span>
                <span className="flex flex-col gap-0.5">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Callout}
                    bold
                  >
                    {category}
                  </Typography>
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Footnote}
                    bold
                    className="tabular-nums text-status-success"
                  >
                    Up to {formatUsd(topSavingsUsd)} off
                  </Typography>
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="tabular-nums"
                  >
                    {count} {count === 1 ? 'deal' : 'deals'}
                  </Typography>
                </span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
