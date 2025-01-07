import type { ReactElement } from 'react';
import React from 'react';
import type { WithClassNameProps } from '../utilities';
import colors from '../../styles/colors';

export const BadgeIconGoldGradient = (): ReactElement => (
  <svg viewBox="0 0 0 0" width="0" height="0">
    <defs>
      <linearGradient
        id="goldGradient"
        x1="0"
        y1="0"
        x2="79.5564"
        y2="71.6044"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={colors.bun['10']} />
        <stop offset="0.275" stopColor={colors.cheese['10']} />
        <stop offset="0.5" stopColor={colors.bun['10']} />
        <stop offset="0.75" stopColor={colors.cheese['10']} />
        <stop offset="1" stopColor={colors.bun['10']} />
      </linearGradient>
    </defs>
  </svg>
);

export const BadgeIcon = ({
  imageUrl,
  ...rest
}: {
  imageUrl: string;
} & WithClassNameProps): ReactElement => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="72"
      height="80"
      viewBox="0 0 72 80"
      fill="none"
      {...rest}
    >
      <path
        d="M6.75 28.889C6.75 12.934 19.847 0 36.001 0c16.155 0 29.251 12.934 29.251 28.889 0 5.21-1.396 10.097-3.839 14.317l9.371 16.031c3.739 6.396-1.673 14.224-9.066 13.112l-1.617-.243c-.589-.089-1.162.238-1.379.786l-.595 1.505c-2.721 6.879-12.291 7.594-16.03 1.198L36 65.167l-6.096 10.428c-3.74 6.396-13.31 5.681-16.031-1.198l-.595-1.505c-.217-.548-.79-.875-1.379-.786l-1.617.243c-7.393 1.112-12.805-6.716-9.066-13.112l9.372-16.033c-2.442-4.22-3.838-9.106-3.838-14.315ZM36.001 7.536c-11.94 0-21.62 9.56-21.62 21.353 0 11.793 9.68 21.353 21.62 21.353 11.941 0 21.621-9.56 21.621-21.353 0-11.793-9.68-21.353-21.621-21.353Zm4.324 49.929 8.392 14.355c.534.914 1.901.812 2.29-.171l.595-1.505c1.518-3.837 5.526-6.122 9.65-5.502l1.617.243c1.056.159 1.829-.959 1.295-1.873l-7.815-13.369c-4.287 4.1-9.84 6.917-16.024 7.822Zm-24.673-7.823-7.816 13.37c-.534.914.239 2.032 1.295 1.873l1.617-.243c4.124-.62 8.132 1.665 9.65 5.502l.595 1.505c.389.983 1.756 1.085 2.29.171l8.393-14.356c-6.184-.905-11.737-3.722-16.024-7.822Z"
        fill="url(#goldGradient)"
      />
      <path
        d="M36.001 7.536c-11.94 0-21.62 9.56-21.62 21.353 0 11.793 9.68 21.353 21.62 21.353 11.941 0 21.621-9.56 21.621-21.353 0-11.793-9.68-21.353-21.621-21.353Z"
        fill="url(#profileImage)"
        transform="matrix(1.01756,0,0,1.03032,-0.633698,-0.875786)"
      />
      <defs>
        {/* This is a hack so that we can properly center the image without fiddling with html and css */}
        <pattern
          id="profileImage"
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
    </svg>
    <BadgeIconGoldGradient />
  </>
);
