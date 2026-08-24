import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

export type SpineTile = {
  id: string;
  label: string;
  value: string;
};

type SectionSpineProps = {
  tiles: SpineTile[];
};

export const SectionSpine = ({ tiles }: SectionSpineProps): ReactElement => {
  return (
    <nav aria-label="Game Center sections">
      <ul className="no-scrollbar -mx-4 flex items-stretch gap-2 overflow-x-auto px-4 laptop:mx-0 laptop:px-0">
        {tiles.map((tile) => (
          <li key={tile.id} className="flex shrink-0 laptop:flex-1">
            <Link href={`#${tile.id}`} passHref>
              <a className="flex w-32 flex-col justify-between gap-2 rounded-14 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover laptop:w-full">
                <Typography
                  type={TypographyType.Subhead}
                  color={TypographyColor.Tertiary}
                >
                  {tile.label}
                </Typography>
                <Typography type={TypographyType.Title3} bold>
                  {tile.value}
                </Typography>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
