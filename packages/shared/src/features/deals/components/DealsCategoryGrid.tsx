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
import type { Deal, DealBrand, DealMedia } from '../types';
import {
  formatUsd,
  getDealBrandPanelBackground,
  getDealCategorySummaries,
} from '../dealsFormat';
import { DealBrandLogo, DealBrandTileSize } from './DealBrandLogo';

interface DealsCategoryGridProps {
  deals: Deal[];
  className?: string;
}

interface CategoryCoverProps {
  media: DealMedia[];
  brands: DealBrand[];
}

/** One photo fills the cover, three become a shelf around a hero. */
const coverColumns: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3 grid-rows-2',
};

/**
 * A shelf that sells objects gets photographed. One that sells subscriptions
 * gets its brands on the tint of the first of them, at the size the photos
 * would have been, so the row stays a row instead of a photo and some gaps.
 */
const CategoryCover = ({ media, brands }: CategoryCoverProps): ReactElement => {
  const [leadBrand] = brands;

  if (!media.length) {
    return (
      <span
        className="flex aspect-[16/10] w-full items-center justify-center gap-2 overflow-hidden"
        style={{ background: getDealBrandPanelBackground(leadBrand) }}
      >
        {brands.map((brand) => (
          <DealBrandLogo
            key={brand.id}
            brand={brand}
            size={DealBrandTileSize.Cover}
            // Three cover tiles are wider than a two-column card on a phone.
            className="!size-10 rounded-12 tablet:!size-14 tablet:rounded-14"
          />
        ))}
      </span>
    );
  }

  return (
    <span
      className={classNames(
        'grid aspect-[16/10] w-full gap-0.5 overflow-hidden bg-surface-float',
        coverColumns[media.length],
      )}
    >
      {media.map(({ imageUrl }, index) => (
        <img
          key={imageUrl}
          src={imageUrl}
          alt=""
          aria-hidden
          loading="lazy"
          className={classNames(
            'size-full object-cover transition-transform duration-200 ease-out group-hover:scale-105',
            media.length === 3 && index === 0 && 'col-span-2 row-span-2',
          )}
        />
      ))}
    </span>
  );
};

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

      <ul className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
        {summaries.map(
          ({ category, path, count, brands, coverMedia, topSavingsUsd }) => (
            <li key={category} className="flex">
              <Link href={path} passHref>
                <a className="group flex flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary transition-colors hover:border-border-subtlest-secondary">
                  <CategoryCover media={coverMedia} brands={brands} />
                  <span className="flex flex-col gap-0.5 p-3">
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
          ),
        )}
      </ul>
    </nav>
  );
};
