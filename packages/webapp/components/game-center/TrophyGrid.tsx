import type { ReactElement } from 'react';
import React from 'react';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { featuredAwardImage } from '@dailydotdev/shared/src/lib/image';
import type { AwardWithRarity } from '../../lib/gameCenter';

type TrophyGridProps = {
  awards: AwardWithRarity[];
};

const Cell = ({ award }: { award: AwardWithRarity }): ReactElement => {
  return (
    <Tooltip content={`${award.name} · ×${award.count.toLocaleString()}`}>
      <div
        role="listitem"
        className="group flex flex-col items-center gap-0.5 py-2 transition hover:-translate-y-1"
      >
        <Image
          src={award.image}
          alt={award.name}
          fallbackSrc={featuredAwardImage}
          loading="lazy"
          className="size-16 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-105"
        />
        <Typography type={TypographyType.Subhead} bold>
          {award.name}
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          ×{award.count.toLocaleString()}
        </Typography>
      </div>
    </Tooltip>
  );
};

export const TrophyGrid = ({ awards }: TrophyGridProps): ReactElement => {
  return (
    <div
      className="grid grid-cols-4 gap-x-2 gap-y-3 tablet:grid-cols-6 laptop:grid-cols-8"
      role="list"
      aria-label="Award collection"
    >
      {awards.map((award) => (
        <Cell key={award.id} award={award} />
      ))}
    </div>
  );
};
