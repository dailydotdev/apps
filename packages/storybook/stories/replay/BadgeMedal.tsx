import type { ReactElement } from 'react';
import React, { useId } from 'react';
import type { RarityTier } from './assets';
import { rarityRamp, rarityRgb } from './assets';

/**
 * The product's own badge shape.
 *
 * Both paths are lifted verbatim from `components/badges/BadgeIcon.tsx`: a
 * medal with two ribbon tails, framing a circular image. It is the shape
 * daily.dev already uses for the Top Reader badge, so a recap frame that draws
 * its own rounded square is inventing a second visual language for the same
 * reward.
 *
 * The gradient is parameterised by rarity tier rather than hard-coded to gold,
 * which is what lets one component carry Top Reader, achievements and quest
 * completions without any of them looking borrowed.
 */

const MEDAL =
  'M6.75 28.889C6.75 12.934 19.847 0 36.001 0c16.155 0 29.251 12.934 29.251 28.889 0 5.21-1.396 10.097-3.839 14.317l9.371 16.031c3.739 6.396-1.673 14.224-9.066 13.112l-1.617-.243c-.589-.089-1.162.238-1.379.786l-.595 1.505c-2.721 6.879-12.291 7.594-16.03 1.198L36 65.167l-6.096 10.428c-3.74 6.396-13.31 5.681-16.031-1.198l-.595-1.505c-.217-.548-.79-.875-1.379-.786l-1.617.243c-7.393 1.112-12.805-6.716-9.066-13.112l9.372-16.033c-2.442-4.22-3.838-9.106-3.838-14.315ZM36.001 7.536c-11.94 0-21.62 9.56-21.62 21.353 0 11.793 9.68 21.353 21.62 21.353 11.941 0 21.621-9.56 21.621-21.353 0-11.793-9.68-21.353-21.621-21.353Zm4.324 49.929 8.392 14.355c.534.914 1.901.812 2.29-.171l.595-1.505c1.518-3.837 5.526-6.122 9.65-5.502l1.617.243c1.056.159 1.829-.959 1.295-1.873l-7.815-13.369c-4.287 4.1-9.84 6.917-16.024 7.822Zm-24.673-7.823-7.816 13.37c-.534.914.239 2.032 1.295 1.873l1.617-.243c4.124-.62 8.132 1.665 9.65 5.502l.595 1.505c.389.983 1.756 1.085 2.29.171l8.393-14.356c-6.184-.905-11.737-3.722-16.024-7.822Z';

const MEDAL_FACE =
  'M36.001 7.536c-11.94 0-21.62 9.56-21.62 21.353 0 11.793 9.68 21.353 21.62 21.353 11.941 0 21.621-9.56 21.621-21.353 0-11.793-9.68-21.353-21.621-21.353Z';

export const BadgeMedal = ({
  imageUrl,
  tier,
  size = 160,
}: {
  imageUrl: string;
  tier: RarityTier;
  size?: number;
}): ReactElement => {
  // Several medals can share a page, so the gradient and pattern ids have to
  // be unique or every medal takes the first one's fill.
  const uid = useId().replace(/:/g, '');
  const ramp = `ramp-${uid}`;
  const face = `face-${uid}`;
  const [from, to] = rarityRamp[tier];

  return (
    <svg
      viewBox="0 0 72 80"
      width={size}
      height={(size * 80) / 72}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        filter: `drop-shadow(0 0 ${size * 0.14}px rgba(${rarityRgb[tier]},0.45))`,
      }}
    >
      <defs>
        <linearGradient
          id={ramp}
          x1="0"
          y1="0"
          x2="79.5564"
          y2="71.6044"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={from} />
          <stop offset="0.275" stopColor={to} />
          <stop offset="0.5" stopColor={from} />
          <stop offset="0.75" stopColor={to} />
          <stop offset="1" stopColor={from} />
        </linearGradient>
        <pattern
          id={face}
          preserveAspectRatio="xMidYMid slice"
          x="0"
          y="0"
          width="1"
          height="1"
          viewBox="0 0 512 512"
        >
          <image width="512" height="512" href={imageUrl} />
        </pattern>
      </defs>
      <path d={MEDAL} fill={`url(#${ramp})`} />
      <path
        d={MEDAL_FACE}
        fill={`url(#${face})`}
        transform="matrix(1.01756,0,0,1.03032,-0.633698,-0.875786)"
      />
    </svg>
  );
};
