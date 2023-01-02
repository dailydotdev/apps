import React, { ReactElement } from 'react';

export default function SquadsInviteMembersSvg(
  props: React.SVGProps<SVGSVGElement>,
): ReactElement {
  return (
    <svg width="240" height="120" {...props}>
      <defs>
        <linearGradient id="a" x1="0%" x2="99.518%" y1="0%" y2="99.518%">
          <stop offset="0%" stopColor="#EF43FD" />
          <stop offset="100%" stopColor="#6451F3" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(60)">
          <rect width="120" height="120" fill="#CE3DF3" rx="60" />
          <path
            fill="#FFF"
            d="M70.407 64.48c2.944 0 5.888.495 8.832 1.483l1.261.454.887.42.863.453c6.517 3.592 10.823 9.945 11.426 17.093l.057.937.006.343-.021.29-.09.383c-.277.87-1 1.545-1.915 1.747l-.404.057-41.795-.004-.258-.018-.384-.09a2.604 2.604 0 0 1-1.749-1.898l-.056-.383.012-.521.062-.932c.689-7.729 5.693-14.518 13.172-17.883 3.365-1.288 6.73-1.932 10.094-1.931Zm-22.265 1.6c.568 0 1.136.02 1.699.065l-.68.66c-4.76 4.782-7.617 11.033-7.913 17.791l-.019.837.002.071.07.69c.068.48.172.946.309 1.395l.184.54h-13.24l-.242-.017-.36-.085a2.441 2.441 0 0 1-1.639-1.779l-.05-.339.009-.38.058-.873c.646-7.247 5.337-13.612 12.349-16.765 3.154-1.209 6.308-1.812 9.463-1.811Zm-.006-30.568c-6.547 0-11.855 5.308-11.855 11.855 0 4.209 2.193 7.905 5.499 10.009a11.803 11.803 0 0 0 6.356 1.846c1.753 0 3.417-.38 4.914-1.063l.734-.366.706-.42.607-.412c.4-.29.781-.605 1.141-.942a18.437 18.437 0 0 1-4.319-11.874c0-2.3.42-4.502 1.188-6.533l.341-.84a11.714 11.714 0 0 0-5.312-1.26Zm22.265-3.637c-6.984 0-12.645 5.661-12.645 12.645 0 4.49 2.339 8.432 5.865 10.676a12.59 12.59 0 0 0 6.78 1.97c1.87 0 3.644-.406 5.241-1.135l.783-.39.753-.447.648-.44a12.618 12.618 0 0 0 5.22-10.234c0-6.984-5.662-12.645-12.645-12.645Z"
          />
        </g>
        <rect width="48" height="48" y="52.764" fill="url(#a)" rx="24" />
        <rect
          width="24"
          height="24"
          x="184.418"
          y="89.2"
          fill="url(#a)"
          rx="12"
        />
        <rect
          width="16"
          height="16"
          x="46.964"
          y="4.673"
          fill="url(#a)"
          rx="8"
        />
        <rect width="32" height="32" x="185.455" fill="url(#a)" rx="16" />
      </g>
    </svg>
  );
}
