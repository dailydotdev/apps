import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useSquadRail } from '@dailydotdev/shared/src/features/squads/components/discover/useSquadRail';
import { squadRailFadeMask } from '@dailydotdev/shared/src/styles/custom';
import type { Source } from '../data';
import { SourceTile } from '../kit';

// The section heading and the sideways tile row, shared by the hub and a
// source's page.

export const SectionHeader = ({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}): ReactElement => (
  <header className="mb-2 flex flex-col gap-0.5">
    <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
      {title}
    </Typography>
    {subtitle && (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {subtitle}
      </Typography>
    )}
  </header>
);

// A row of tiles that scrolls sideways, on the hub's rail hooks. Arrows from
// laptop; phones and tablets swipe.
export const TileRail = ({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Source[];
}): ReactElement => {
  const rail = useSquadRail();
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <SectionHeader title={title} subtitle={subtitle} />
        </div>
        {(['back', 'forward'] as const).map((way) => (
          <Button
            key={way}
            type="button"
            aria-label={way === 'back' ? 'Previous' : 'Next'}
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            className="!hidden laptop:!flex"
            disabled={way === 'back' ? rail.isAtStart : rail.isAtEnd}
            icon={
              <ArrowIcon
                className={way === 'back' ? '-rotate-90' : 'rotate-90'}
              />
            }
            onClick={() => rail.scroll(way === 'back' ? -1 : 1)}
          />
        ))}
      </div>
      <div
        ref={rail.ref}
        onScroll={rail.onScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 [--squad-rail-fade:3rem] laptop:-mx-6 laptop:scroll-px-6 laptop:px-6"
        style={{
          maskImage: squadRailFadeMask(rail),
          WebkitMaskImage: squadRailFadeMask(rail),
        }}
      >
        {items.map((source) => (
          <SourceTile
            key={source.id}
            source={source}
            className="w-36 snap-start tablet:w-44"
          />
        ))}
      </div>
    </section>
  );
};
