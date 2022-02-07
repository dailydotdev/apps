import React, { ReactElement } from 'react';

const getColorPrefix = (rank: number, isLocked?: boolean) => {
  if (isLocked) {
    return '--theme-rank-1-color';
  }

  return rank > 0 ? `--theme-rank-${rank}-color` : '--theme-rank-5-color';
};

export default function DevCardPlaceholder({
  profileImage,
  rank,
  isLocked,
  style,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  profileImage?: string;
  rank?: number;
  isLocked?: boolean;
}): ReactElement {
  const colorPrefix = getColorPrefix(rank, isLocked);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 108 148"
      {...props}
      style={{ ...style, opacity: isLocked ? 0.2 : 1 }}
    >
      <defs>
        <linearGradient
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
          id="devcard_placeholder_svg__b"
        >
          <stop stopColor={`var(${colorPrefix}-top)`} offset="0%" />
          <stop stopColor={`var(${colorPrefix}-bottom)`} offset="100%" />
        </linearGradient>
        <pattern
          id="devcard_placeholder_svg__c"
          patternUnits="objectBoundingBox"
          x="-15.28%"
          width="115.28%"
          height="100%"
        >
          <use
            xlinkHref="#devcard_placeholder_svg__a"
            transform="scale(.03547)"
          />
        </pattern>
        <image
          id="devcard_placeholder_svg__a"
          width={2300}
          height={2030}
          xlinkHref={profileImage}
        />
      </defs>
      <g fill="none" fillRule="evenodd">
        <path
          d="M94.803 0c7.184 0 13.027 5.74 13.192 12.884l.004.311v121.61c0 7.183-5.74 13.026-12.884 13.191l-.312.004H13.195C6.012 148 .17 142.26.004 135.116L0 134.805V13.195C0 6.012 5.74.17 12.884.004L13.195 0h81.608zm0 4H13.195a9.196 9.196 0 00-9.191 8.929L4 13.195v121.61a9.195 9.195 0 008.929 9.191l.266.004h81.608a9.196 9.196 0 009.192-8.929l.004-.266V13.195c0-4.989-3.974-9.05-8.93-9.191L94.804 4zM13.135 9.517l81.789.002a3.68 3.68 0 013.55 3.421l.008.195v30.833A41.337 41.337 0 0071.5 34C48.58 34 30 52.58 30 75.5S48.58 117 71.5 117a41.337 41.337 0 0026.982-9.968l-.002 27.893a3.68 3.68 0 01-3.421 3.55l-.195.008-81.789-.002a3.68 3.68 0 01-3.55-3.421l-.008-.195.002-121.79a3.68 3.68 0 013.421-3.55l.195-.008zM60.216 123.77H56.98a2.06 2.06 0 00-2.054 1.906l-.005.154v3.237a2.06 2.06 0 001.906 2.054l.153.005h3.237a2.06 2.06 0 002.054-1.906l.006-.153v-3.237a2.06 2.06 0 00-1.906-2.054l-.154-.006zm-9.655 0h-3.237a2.06 2.06 0 00-2.054 1.906l-.006.154v3.237a2.06 2.06 0 001.906 2.054l.154.005h3.237a2.06 2.06 0 002.054-1.906l.006-.153v-3.237a2.06 2.06 0 00-1.906-2.054l-.154-.006zm-9.655 0h-3.237a2.06 2.06 0 00-2.054 1.906l-.006.154v3.237a2.06 2.06 0 001.906 2.054l.154.005h3.237a2.06 2.06 0 002.054-1.906l.006-.153v-3.237a2.06 2.06 0 00-1.907-2.054l-.153-.006zm-9.655 0h-3.237a2.06 2.06 0 00-2.054 1.906l-.006.154v3.237a2.06 2.06 0 001.906 2.054l.154.005h3.237a2.06 2.06 0 002.054-1.906l.005-.153v-3.237a2.06 2.06 0 00-1.906-2.054l-.153-.006zm-9.656 0H18.36a2.06 2.06 0 00-2.054 1.906l-.006.154v3.237a2.06 2.06 0 001.906 2.054l.154.005h3.236a2.06 2.06 0 002.055-1.906l.005-.153v-3.237a2.06 2.06 0 00-1.906-2.054l-.154-.006zM23.31 14.115a9.195 9.195 0 100 18.39 9.195 9.195 0 000-18.39zm63.22 6.895H38.443a2.299 2.299 0 00-.155 4.59l.195.008h48.085a2.299 2.299 0 00.118-4.592l-.157-.006z"
          fill="url(#devcard_placeholder_svg__b)"
        />
        {profileImage && (
          <path
            d="M72 40c10.474 0 19.903 4.473 26.482 11.613v48.774C91.903 107.527 82.474 112 72 112c-19.882 0-36-16.118-36-36s16.118-36 36-36z"
            fill="url(#devcard_placeholder_svg__c)"
          />
        )}
      </g>
    </svg>
  );
}
