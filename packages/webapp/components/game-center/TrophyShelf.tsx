import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { featuredAwardImage } from '@dailydotdev/shared/src/lib/image';
import type { TrophyShelfItem } from '../../lib/gameCenter';

type TrophyProps = {
  item: TrophyShelfItem;
};

const Trophy = ({ item }: TrophyProps): ReactElement => {
  const { name, image, count, size, imageGlow } = item;
  const glowStyle: CSSProperties | undefined = imageGlow
    ? {
        background: `radial-gradient(closest-side, ${imageGlow}, transparent 72%)`,
      }
    : undefined;

  return (
    <Tooltip content={`${name} · ×${count.toLocaleString()}`} side="top">
      <div
        role="listitem"
        className="group flex shrink-0 flex-col items-center"
        style={{ width: size }}
      >
        <div className="relative flex w-full items-end justify-center">
          {glowStyle && (
            <span
              aria-hidden
              className="opacity-60 group-hover:opacity-90 pointer-events-none absolute inset-[-14%] rounded-full blur-md transition-opacity"
              style={glowStyle}
            />
          )}
          <Image
            src={image}
            alt={name}
            fallbackSrc={featuredAwardImage}
            loading="lazy"
            className="relative w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:-translate-y-1.5"
          />
          <span className="bg-background-default/80 absolute -bottom-1 right-0 rounded-full border border-border-subtlest-tertiary px-2 py-0.5 backdrop-blur">
            <Typography type={TypographyType.Caption2} bold>
              ×{count.toLocaleString()}
            </Typography>
          </span>
        </div>
        <Typography
          type={TypographyType.Caption1}
          bold
          className="mt-4 max-w-full truncate text-center"
        >
          {name}
        </Typography>
      </div>
    </Tooltip>
  );
};

type TrophyShelfProps = {
  shelves: TrophyShelfItem[][];
};

export const TrophyShelf = ({ shelves }: TrophyShelfProps): ReactElement => {
  return (
    <div
      className="flex flex-col gap-2"
      role="list"
      aria-label="Award collection"
    >
      {shelves.map((row) => (
        <div
          key={row.map((item) => item.id).join('-')}
          className="flex flex-col"
        >
          <div className="flex flex-wrap items-end justify-center gap-x-8 gap-y-6 px-2 pt-6">
            {row.map((item) => (
              <Trophy key={item.id} item={item} />
            ))}
          </div>
          <div className="relative mx-auto h-2 w-[92%] rounded-b-8 bg-gradient-to-b from-surface-float to-transparent shadow-[0_12px_24px_-12px_rgba(0,0,0,0.6)]">
            <span
              aria-hidden
              className="absolute inset-x-[6%] top-0 h-px bg-border-subtlest-primary"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
