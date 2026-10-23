import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { CoverSource, CoverVariant } from '../../../lib/cover';
import { getCoverBrand } from '../../../lib/cover';
import {
  buildCoverPattern,
  COVER_HEIGHT,
  COVER_WIDTH,
} from '../../../lib/coverPattern';
import colors from '../../../styles/colors';

interface GeneratedCoverProps {
  post: Pick<Post, 'id' | 'hook'> & { source?: CoverSource };
  variant: Extract<CoverVariant, 'pattern' | 'hook'>;
  className?: string;
}

// Stands in for the cover image of a post that has none. A dark field like
// the og banners the feed is full of, with a glow and a pattern in the
// source's brand colour, composed from the post id so no two posts match.
// The field stays dark in the light theme, as a real cover image would.
export function GeneratedCover({
  post,
  variant,
  className,
}: GeneratedCoverProps): ReactElement {
  const pattern = useMemo(() => buildCoverPattern(post.id), [post.id]);
  const brand = getCoverBrand(post.source);
  const gradientId = `cover-glow-${post.id}`;

  // The outer box carries the same classes the cover image had, padding
  // included, so the painted card keeps the image's inset from the card edge.
  return (
    <div
      className={classNames('h-40 rounded-12', className)}
      data-testid="generatedCover"
      data-cover={variant}
      data-pattern={pattern.family}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-12"
        style={{ background: colors.pepper['90'], color: brand }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${COVER_WIDTH} ${COVER_HEIGHT}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <radialGradient
              id={gradientId}
              cx={`${pattern.glow.cx}%`}
              cy={`${pattern.glow.cy}%`}
              r="70%"
            >
              <stop offset="0" stopColor="currentColor" stopOpacity="0.45" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect
            width={COVER_WIDTH}
            height={COVER_HEIGHT}
            fill={`url(#${gradientId})`}
          />
          {pattern.shapes.map((shape, index) => {
            const key = `${shape.kind}-${index}`;
            switch (shape.kind) {
              case 'line':
                return (
                  <line
                    key={key}
                    x1={shape.x1}
                    y1={shape.y1}
                    x2={shape.x2}
                    y2={shape.y2}
                    stroke="currentColor"
                    strokeWidth={shape.width}
                    strokeOpacity={shape.opacity}
                    transform={`rotate(${shape.rotate} ${COVER_WIDTH / 2} ${
                      COVER_HEIGHT / 2
                    })`}
                  />
                );
              case 'ring':
                return (
                  <circle
                    key={key}
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={shape.width}
                    strokeOpacity={shape.opacity}
                  />
                );
              case 'dot':
                return (
                  <circle
                    key={key}
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.r}
                    fill="currentColor"
                    fillOpacity={shape.opacity}
                  />
                );
              default:
                return (
                  <rect
                    key={key}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    rx={1.5}
                    fill="currentColor"
                    fillOpacity={shape.opacity}
                    transform={`rotate(${shape.rotate} ${COVER_WIDTH / 2} ${
                      COVER_HEIGHT / 2
                    })`}
                  />
                );
            }
          })}
        </svg>
        {variant === 'hook' && (
          <p
            className="absolute inset-x-3 bottom-3 line-clamp-3 break-words font-bold typo-callout"
            style={{
              color: colors.salt['0'],
              textShadow: `0 2px 10px ${colors.pepper['90']}`,
            }}
          >
            {post.hook}
            <span
              className="mt-2 block h-0.5 w-7 rounded-8"
              style={{ background: brand }}
              aria-hidden
            />
          </p>
        )}
      </div>
    </div>
  );
}
