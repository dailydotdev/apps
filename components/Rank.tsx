import React, {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  LegacyRef,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import classNames from 'classnames';

export interface RankProps extends HTMLAttributes<SVGElement> {
  rank: number;
  colorByRank?: boolean;
}

const rankPaths: ((fill: string) => ReactNode)[] = [
  (fill) => (
    <>
      <path
        d="M5.72527887,9.79277747 L11.4505577,8.1569835 C11.8096676,8.0543807 12.1903324,8.0543807 12.5494423,8.1569835 L18.2747211,9.79277747 C18.7040227,9.91543505 19,10.3078211 19,10.7543014 L19,15.337135 C19,15.6132774 18.7761424,15.837135 18.5,15.837135 C18.4535417,15.837135 18.4073102,15.83066 18.3626394,15.817897 L12.5494423,14.1569835 C12.1903324,14.0543807 11.8096676,14.0543807 11.4505577,14.1569835 L5.63736056,15.817897 C5.37184306,15.8937591 5.09510017,15.7400131 5.01923803,15.4744956 C5.00647496,15.4298248 5,15.3835933 5,15.337135 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 Z"
        fill={fill}
      />
      <path
        d="M5.72527887,9.79277747 L11.4505577,8.1569835 C11.8096676,8.0543807 12.1903324,8.0543807 12.5494423,8.1569835 L18.2747211,9.79277747 C18.7040227,9.91543505 19,10.3078211 19,10.7543014 L19,13 L12,11 L5,13 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
      <path
        d="M12,8.0800314 L12,14.0800314 C11.8150563,14.0800314 11.6301127,14.1056821 11.4505577,14.1569835 L5.63736056,15.817897 C5.37184306,15.8937591 5.09510017,15.7400131 5.01923803,15.4744956 C5.00647496,15.4298248 5,15.3835933 5,15.337135 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 L11.4505577,8.1569835 C11.6301127,8.1056821 11.8150563,8.0800314 12,8.0800314 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
    </>
  ),
  (fill) => (
    <>
      <path
        d="M12.5494423,12.1569835 L18.2747211,13.7927775 C18.7040227,13.9154351 19,14.3078211 19,14.7543014 L19,18.337135 C19,18.6132774 18.7761424,18.837135 18.5,18.837135 C18.4535417,18.837135 18.4073102,18.83066 18.3626394,18.817897 L12.5494423,17.1569835 C12.1903324,17.0543807 11.8096676,17.0543807 11.4505577,17.1569835 L5.63736056,18.817897 C5.37184306,18.8937591 5.09510017,18.7400131 5.01923803,18.4744956 C5.00647496,18.4298248 5,18.3835933 5,18.337135 L5,14.7543014 C5,14.3078211 5.29597731,13.9154351 5.72527887,13.7927775 L11.4505577,12.1569835 C11.8096676,12.0543807 12.1903324,12.0543807 12.5494423,12.1569835 Z M12.5494423,5.1569835 L18.2747211,6.79277747 C18.7040227,6.91543505 19,7.30782105 19,7.75430141 L19,11.337135 C19,11.6132774 18.7761424,11.837135 18.5,11.837135 C18.4535417,11.837135 18.4073102,11.83066 18.3626394,11.817897 L12.5494423,10.1569835 C12.1903324,10.0543807 11.8096676,10.0543807 11.4505577,10.1569835 L5.63736056,11.817897 C5.37184306,11.8937591 5.09510017,11.7400131 5.01923803,11.4744956 C5.00647496,11.4298248 5,11.3835933 5,11.337135 L5,7.75430141 C5,7.30782105 5.29597731,6.91543505 5.72527887,6.79277747 L11.4505577,5.1569835 C11.8096676,5.0543807 12.1903324,5.0543807 12.5494423,5.1569835 Z"
        fill={fill}
      />
      <path
        d="M12.5494423,12.1569835 L18.2747211,13.7927775 C18.7040227,13.9154351 19,14.3078211 19,14.7543014 L19,16.5 L12,14.5 L5,16.5 L5,14.7543014 C5,14.3078211 5.29597731,13.9154351 5.72527887,13.7927775 L11.4505577,12.1569835 C11.8096676,12.0543807 12.1903324,12.0543807 12.5494423,12.1569835 Z M12.5494423,5.1569835 L18.2747211,6.79277747 C18.7040227,6.91543505 19,7.30782105 19,7.75430141 L19,9.5 L12,7.5 L5,9.5 L5,7.75430141 C5,7.30782105 5.29597731,6.91543505 5.72527887,6.79277747 L11.4505577,5.1569835 C11.8096676,5.0543807 12.1903324,5.0543807 12.5494423,5.1569835 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
      <path
        d="M12,12.0800314 L12,17.0800314 C11.8150563,17.0800314 11.6301127,17.1056821 11.4505577,17.1569835 L5.63736056,18.817897 C5.37184306,18.8937591 5.09510017,18.7400131 5.01923803,18.4744956 C5.00647496,18.4298248 5,18.3835933 5,18.337135 L5,14.7543014 C5,14.3078211 5.29597731,13.9154351 5.72527887,13.7927775 L11.47,12.1510314 L11.6317093,12.1142323 C11.7534084,12.0914317 11.8767042,12.0800314 12,12.0800314 Z M12,5.0800314 L12,10.0800314 C11.8150563,10.0800314 11.6301127,10.1056821 11.4505577,10.1569835 L5.63736056,11.817897 C5.37184306,11.8937591 5.09510017,11.7400131 5.01923803,11.4744956 C5.00647496,11.4298248 5,11.3835933 5,11.337135 L5,7.75430141 C5,7.30782105 5.29597731,6.91543505 5.72527887,6.79277747 L11.47,5.1510314 L11.6317093,5.11423233 C11.7534084,5.09143171 11.8767042,5.0800314 12,5.0800314 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
    </>
  ),
  (fill) => (
    <>
      <path
        d="M12.5494423,16.1569835 L18.2747211,17.7927775 C18.7040227,17.9154351 19,18.3078211 19,18.7543014 L19,19.337135 C19,19.6132774 18.7761424,19.837135 18.5,19.837135 C18.4535417,19.837135 18.4073102,19.83066 18.3626394,19.817897 L12.5494423,18.1569835 C12.1903324,18.0543807 11.8096676,18.0543807 11.4505577,18.1569835 L5.63736056,19.817897 C5.37184306,19.8937591 5.09510017,19.7400131 5.01923803,19.4744956 C5.00647496,19.4298248 5,19.3835933 5,19.337135 L5,18.7543014 C5,18.3078211 5.29597731,17.9154351 5.72527887,17.7927775 L11.4505577,16.1569835 C11.8096676,16.0543807 12.1903324,16.0543807 12.5494423,16.1569835 Z M12.5494423,8.1569835 L18.2747211,9.79277747 C18.7040227,9.91543505 19,10.3078211 19,10.7543014 L19,15.337135 C19,15.6132774 18.7761424,15.837135 18.5,15.837135 C18.4535417,15.837135 18.4073102,15.83066 18.3626394,15.817897 L12.5494423,14.1569835 C12.1903324,14.0543807 11.8096676,14.0543807 11.4505577,14.1569835 L5.63736056,15.817897 C5.37184306,15.8937591 5.09510017,15.7400131 5.01923803,15.4744956 C5.00647496,15.4298248 5,15.3835933 5,15.337135 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 L11.4505577,8.1569835 C11.8096676,8.0543807 12.1903324,8.0543807 12.5494423,8.1569835 Z M12.5494423,4.1569835 L18.2747211,5.79277747 C18.7040227,5.91543505 19,6.30782105 19,6.75430141 L19,7.33713501 C19,7.61327738 18.7761424,7.83713501 18.5,7.83713501 C18.4535417,7.83713501 18.4073102,7.83066005 18.3626394,7.81789698 L12.5494423,6.1569835 C12.1903324,6.0543807 11.8096676,6.0543807 11.4505577,6.1569835 L5.63736056,7.81789698 C5.37184306,7.89375913 5.09510017,7.74001308 5.01923803,7.47449557 C5.00647496,7.42982484 5,7.38359327 5,7.33713501 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.8096676,4.0543807 12.1903324,4.0543807 12.5494423,4.1569835 Z"
        fill={fill}
      />
      <path
        d="M12.5494423,16.1569835 L18.2747211,17.7927775 C18.7040227,17.9154351 19,18.3078211 19,18.7543014 L19,19 L12,17 L5,19 L5,18.7543014 C5,18.3078211 5.29597731,17.9154351 5.72527887,17.7927775 L11.4505577,16.1569835 C11.8096676,16.0543807 12.1903324,16.0543807 12.5494423,16.1569835 Z M12.5494423,8.1569835 L18.2747211,9.79277747 C18.7040227,9.91543505 19,10.3078211 19,10.7543014 L19,13 L12,11 L5,13 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 L11.4505577,8.1569835 C11.8096676,8.0543807 12.1903324,8.0543807 12.5494423,8.1569835 Z M12.5494423,4.1569835 L18.2747211,5.79277747 C18.7040227,5.91543505 19,6.30782105 19,6.75430141 L19,7 L12,5 L5,7 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.8096676,4.0543807 12.1903324,4.0543807 12.5494423,4.1569835 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
      <path
        d="M12,16.0800314 L12,18.0800314 C11.8150563,18.0800314 11.6301127,18.1056821 11.4505577,18.1569835 L5.63736056,19.817897 C5.37184306,19.8937591 5.09510017,19.7400131 5.01923803,19.4744956 C5.00647496,19.4298248 5,19.3835933 5,19.337135 L5,18.7543014 C5,18.3078211 5.29597731,17.9154351 5.72527887,17.7927775 L11.4505577,16.1569835 C11.6301127,16.1056821 11.8150563,16.0800314 12,16.0800314 Z M12,8.0800314 L12,14.0800314 C11.8150563,14.0800314 11.6301127,14.1056821 11.4505577,14.1569835 L5.63736056,15.817897 C5.37184306,15.8937591 5.09510017,15.7400131 5.01923803,15.4744956 C5.00647496,15.4298248 5,15.3835933 5,15.337135 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 L11.4505577,8.1569835 C11.570261,8.12278257 11.6923593,8.09998194 11.8152559,8.08858163 L12,8.0800314 Z M12,4.0800314 L12,6.0800314 C11.8150563,6.0800314 11.6301127,6.1056821 11.4505577,6.1569835 L5.63736056,7.81789698 C5.37184306,7.89375913 5.09510017,7.74001308 5.01923803,7.47449557 C5.00647496,7.42982484 5,7.38359327 5,7.33713501 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.6301127,4.1056821 11.8150563,4.0800314 12,4.0800314 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
    </>
  ),
  (fill) => (
    <>
      <path
        d="M13.1211031,16.3210755 L18.2747211,17.7927775 C18.7040227,17.9154351 19,18.3078211 19,18.7543014 L19,19.337135 C19,19.6132774 18.7761424,19.837135 18.5,19.837135 C18.4535417,19.837135 18.4073102,19.83066 18.3626394,19.817897 L12.5494423,18.1569835 C12.1903324,18.0543807 11.8096676,18.0543807 11.4505577,18.1569835 L5.63736056,19.817897 C5.37184306,19.8937591 5.09510017,19.7400131 5.01923803,19.4744956 C5.00647496,19.4298248 5,19.3835933 5,19.337135 L5,18.7543014 C5,18.3078211 5.29597731,17.9154351 5.72527887,17.7927775 L10.8788969,16.3210755 C11.5823482,16.6740234 12.4176518,16.6740234 13.1211031,16.3210755 Z M15.668,9.0470314 L18.2747211,9.79277747 C18.7040227,9.91543505 19,10.3078211 19,10.7543014 L19,15.337135 C19,15.6132774 18.7761424,15.837135 18.5,15.837135 C18.4535417,15.837135 18.4073102,15.83066 18.3626394,15.817897 L14.816,14.8040314 L16.3535534,13.267767 C17.3298641,12.2914562 17.3298641,10.7085438 16.3535534,9.73223305 L15.668,9.0470314 Z M8.331,9.0470314 L7.64644661,9.73223305 C6.67013588,10.7085438 6.67013588,12.2914562 7.64644661,13.267767 L9.183,14.8040314 L5.63736056,15.817897 C5.37184306,15.8937591 5.09510017,15.7400131 5.01923803,15.4744956 C5.00647496,15.4298248 5,15.3835933 5,15.337135 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 L8.331,9.0470314 Z M12.7071068,8.20710678 L15.2928932,10.7928932 C15.6834175,11.1834175 15.6834175,11.8165825 15.2928932,12.2071068 L12.7071068,14.7928932 C12.3165825,15.1834175 11.6834175,15.1834175 11.2928932,14.7928932 L8.70710678,12.2071068 C8.31658249,11.8165825 8.31658249,11.1834175 8.70710678,10.7928932 L11.2928932,8.20710678 C11.6834175,7.81658249 12.3165825,7.81658249 12.7071068,8.20710678 Z M12.5494423,4.1569835 L18.2747211,5.79277747 C18.7040227,5.91543505 19,6.30782105 19,6.75430141 L19,7.33713501 C19,7.61327738 18.7761424,7.83713501 18.5,7.83713501 C18.4535417,7.83713501 18.4073102,7.83066005 18.3626394,7.81789698 L12.5494423,6.1569835 C12.1903324,6.0543807 11.8096676,6.0543807 11.4505577,6.1569835 L5.63736056,7.81789698 C5.37184306,7.89375913 5.09510017,7.74001308 5.01923803,7.47449557 C5.00647496,7.42982484 5,7.38359327 5,7.33713501 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.8096676,4.0543807 12.1903324,4.0543807 12.5494423,4.1569835 Z"
        fill={fill}
      />
      <path
        d="M13.1211031,16.3210755 L18.2747211,17.7927775 C18.7040227,17.9154351 19,18.3078211 19,18.7543014 L19,19 L12,17 L5,19 L5,18.7543014 C5,18.3078211 5.29597731,17.9154351 5.72527887,17.7927775 L10.8788969,16.3210755 C11.5823482,16.6740234 12.4176518,16.6740234 13.1211031,16.3210755 Z M15.668,9.0470314 L18.2747211,9.79277747 C18.7040227,9.91543505 19,10.3078211 19,10.7543014 L19,13 L16.917127,12.4044276 C17.2638485,11.5092527 17.0759907,10.4546703 16.3535534,9.73223305 L15.668,9.0470314 Z M8.331,9.0470314 L7.64644661,9.73223305 C6.92400932,10.4546703 6.73615147,11.5092527 7.08287304,12.4044276 L5,13 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 L8.331,9.0470314 Z M12.5494423,4.1569835 L18.2747211,5.79277747 C18.7040227,5.91543505 19,6.30782105 19,6.75430141 L19,7 L12,5 L5,7 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.8096676,4.0543807 12.1903324,4.0543807 12.5494423,4.1569835 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
      <path
        d="M10.8788969,16.3210755 C11.2307749,16.4976259 11.6156444,16.5858628 12.0004997,16.5857864 L12,18.0800314 C11.8150563,18.0800314 11.6301127,18.1056821 11.4505577,18.1569835 L5.63736056,19.817897 C5.37184306,19.8937591 5.09510017,19.7400131 5.01923803,19.4744956 C5.00647496,19.4298248 5,19.3835933 5,19.337135 L5,18.7543014 C5,18.3078211 5.29597731,17.9154351 5.72527887,17.7927775 L10.8788969,16.3210755 Z M8.331,9.0470314 L7.64644661,9.73223305 C6.67013588,10.7085438 6.67013588,12.2914562 7.64644661,13.267767 L9.183,14.8040314 L5.63736056,15.817897 C5.37184306,15.8937591 5.09510017,15.7400131 5.01923803,15.4744956 C5.00647496,15.4298248 5,15.3835933 5,15.337135 L5,10.7543014 C5,10.3078211 5.29597731,9.91543505 5.72527887,9.79277747 L8.331,9.0470314 Z M12,11.5 L12,15.0857864 C11.7440777,15.0857864 11.4881554,14.9881554 11.2928932,14.7928932 L8.70021356,12.2 L8.62391817,12.1128994 C8.4841151,11.9330993 8.41421356,11.7165497 8.41421356,11.5 L12,11.5 Z M11.9994952,7.91421356 C12.2526538,7.9140867 12.5058513,8.0094935 12.7003718,8.20043409 L15.2928932,10.7928932 C15.4881554,10.9881554 15.5857864,11.2440777 15.5857864,11.5 L12,11.5 L11.9994952,7.91421356 Z M12,4.0800314 L12,6.0800314 C11.8150563,6.0800314 11.6301127,6.1056821 11.4505577,6.1569835 L5.63736056,7.81789698 C5.37184306,7.89375913 5.09510017,7.74001308 5.01923803,7.47449557 C5.00647496,7.42982484 5,7.38359327 5,7.33713501 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.6301127,4.1056821 11.8150563,4.0800314 12,4.0800314 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
      <path
        d="M12,7.91421356 L12,11.5 L8.41421356,11.5 C8.41421356,11.2478474 8.50898962,10.9956948 8.69854173,10.8015611 L11.3012136,8.19821356 L11.3871006,8.12391817 C11.5669007,7.9841151 11.7834503,7.91421356 12,7.91421356 Z"
        fillOpacity="0.56"
        fill="#FFFFFF"
      />
    </>
  ),
  (fill) => (
    <>
      <path
        d="M15.743,15.0690314 L18.2747211,15.7927775 C18.7040227,15.9154351 19,16.3078211 19,16.7543014 L19,19.337135 C19,19.6132774 18.7761424,19.837135 18.5,19.837135 C18.4535417,19.837135 18.4073102,19.83066 18.3626394,19.817897 L12.5494423,18.1569835 C12.1903324,18.0543807 11.8096676,18.0543807 11.4505577,18.1569835 L5.63736056,19.817897 C5.37184306,19.8937591 5.09510017,19.7400131 5.01923803,19.4744956 C5.00647496,19.4298248 5,19.3835933 5,19.337135 L5,16.7543014 C5,16.3078211 5.29597731,15.9154351 5.72527887,15.7927775 L8.25613802,15.0702573 L10.75,16.510363 C11.5235027,16.956945 12.4764973,16.956945 13.25,16.510363 L15.743,15.0690314 Z M12.5,7.78867513 L14.9641016,9.21132487 C15.2735027,9.38995766 15.4641016,9.72008468 15.4641016,10.0773503 L15.4641016,12.9226497 C15.4641016,13.2799153 15.2735027,13.6100423 14.9641016,13.7886751 L12.5,15.2113249 C12.1905989,15.3899577 11.8094011,15.3899577 11.5,15.2113249 L9.03589838,13.7886751 C8.72649731,13.6100423 8.53589838,13.2799153 8.53589838,12.9226497 L8.53589838,10.0773503 C8.53589838,9.72008468 8.72649731,9.38995766 9.03589838,9.21132487 L11.5,7.78867513 C11.8094011,7.61004234 12.1905989,7.61004234 12.5,7.78867513 Z M16.964,11.4180314 L18.2747211,11.7927775 C18.7040227,11.9154351 19,12.3078211 19,12.7543014 L19,13.337135 C19,13.6132774 18.7761424,13.837135 18.5,13.837135 C18.4535417,13.837135 18.4073102,13.83066 18.3626394,13.817897 L16.9171608,13.405133 C16.948086,13.2478628 16.9641016,13.0863965 16.9641016,12.9226497 L16.964,11.4180314 Z M7.035,11.4180314 L7.03589838,12.9226497 C7.03589838,13.0863965 7.05191399,13.2478628 7.08283916,13.405133 L5.63736056,13.817897 C5.37184306,13.8937591 5.09510017,13.7400131 5.01923803,13.4744956 C5.00647496,13.4298248 5,13.3835933 5,13.337135 L5,12.7543014 C5,12.3078211 5.29597731,11.9154351 5.72527887,11.7927775 L7.035,11.4180314 Z M12.5494423,4.1569835 L18.2747211,5.79277747 C18.7040227,5.91543505 19,6.30782105 19,6.75430141 L19,9.33713501 C19,9.61327738 18.7761424,9.83713501 18.5,9.83713501 C18.4535417,9.83713501 18.4073102,9.83066005 18.3626394,9.81789698 L16.8678422,9.39010791 C16.691916,8.77495233 16.2834728,8.24101338 15.7141016,7.91228676 L13.25,6.48963703 C12.4764973,6.04305504 11.5235027,6.04305504 10.75,6.48963703 L8.28589838,7.91228676 C7.71652717,8.24101338 7.30808398,8.77495233 7.13215776,9.39010791 L5.63736056,9.81789698 C5.37184306,9.89375913 5.09510017,9.74001308 5.01923803,9.47449557 C5.00647496,9.42982484 5,9.38359327 5,9.33713501 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.8096676,4.0543807 12.1903324,4.0543807 12.5494423,4.1569835 Z"
        fill={fill}
      />
      <path
        d="M15.743,15.0690314 L18.2747211,15.7927775 C18.7040227,15.9154351 19,16.3078211 19,16.7543014 L19,18 L13.428,16.4070314 L15.743,15.0690314 Z M8.25613802,15.0702573 L10.571,16.4070314 L5,18 L5,16.7543014 C5,16.3078211 5.29597731,15.9154351 5.72527887,15.7927775 L8.25613802,15.0702573 Z M16.964,11.4180314 L18.2747211,11.7927775 C18.7040227,11.9154351 19,12.3078211 19,12.7543014 L19,13 L16.964,12.4170314 L16.964,11.4180314 Z M7.035,11.4180314 L7.035,12.4180314 L5,13 L5,12.7543014 C5,12.3078211 5.29597731,11.9154351 5.72527887,11.7927775 L7.035,11.4180314 Z M12.5494423,4.1569835 L18.2747211,5.79277747 C18.7040227,5.91543505 19,6.30782105 19,6.75430141 L19,8 L12,6 L5,8 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.8096676,4.0543807 12.1903324,4.0543807 12.5494423,4.1569835 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
      <path
        d="M8.25613802,15.0702573 L10.75,16.510363 C11.13705,16.7338264 11.5690423,16.8454718 12.0009999,16.8452993 L12,18.0800314 C11.8150563,18.0800314 11.6301127,18.1056821 11.4505577,18.1569835 L5.63736056,19.817897 C5.37184306,19.8937591 5.09510017,19.7400131 5.01923803,19.4744956 C5.00647496,19.4298248 5,19.3835933 5,19.337135 L5,16.7543014 C5,16.3078211 5.29597731,15.9154351 5.72527887,15.7927775 L8.25613802,15.0702573 Z M12,11.5 L15.3304175,13.4221462 C15.2440827,13.5718832 15.1189758,13.6992585 14.9641016,13.7886751 L12.5,15.2113249 C12.3452995,15.3006413 12.1726497,15.3452995 12,15.3452995 L12,11.5 Z M7.035,11.4180314 L7.03589838,12.9226497 C7.03589838,13.0863965 7.05191399,13.2478628 7.08283916,13.405133 L5.63736056,13.817897 C5.37184306,13.8937591 5.09510017,13.7400131 5.01923803,13.4744956 C5.00647496,13.4298248 5,13.3835933 5,13.337135 L5,12.7543014 C5,12.3078211 5.29597731,11.9154351 5.72527887,11.7927775 L7.035,11.4180314 Z M12,7.65470054 C12.1668947,7.65470054 12.3337895,7.69643114 12.4844708,7.77989236 L14.969,9.21470054 L15.0627367,9.27630944 C15.1724478,9.3582728 15.2629855,9.46105767 15.330127,9.57735027 L8.66987298,13.4226497 C8.58354812,13.2731307 8.53589838,13.1012825 8.53589838,12.9226497 L8.53589838,10.0773503 C8.53589838,9.89871747 8.58354812,9.72686932 8.66987298,9.57735027 L11.999,11.4980314 L12,7.65470054 Z M12,4.0800314 L12.0009999,6.15470074 C11.5690423,6.15452818 11.13705,6.26617361 10.75,6.48963703 L8.28589838,7.91228676 C7.71652717,8.24101338 7.30808398,8.77495233 7.13215776,9.39010791 L5.63736056,9.81789698 C5.37184306,9.89375913 5.09510017,9.74001308 5.01923803,9.47449557 C5.00647496,9.42982484 5,9.38359327 5,9.33713501 L5,6.75430141 C5,6.30782105 5.29597731,5.91543505 5.72527887,5.79277747 L11.4505577,4.1569835 C11.6301127,4.1056821 11.8150563,4.0800314 12,4.0800314 Z"
        fillOpacity="0.16"
        fill="#FFFFFF"
      />
      <path
        d="M12,7.65470054 L12,11.5 L8.66987298,9.57735027 C8.7538726,9.43185867 8.8744919,9.30750945 9.02346215,9.21862449 L11.517873,7.77870054 L11.6191104,7.73006125 C11.7410254,7.67982078 11.8705127,7.65470054 12,7.65470054 Z"
        fillOpacity="0.4"
        fill="#FFFFFF"
      />
    </>
  ),
];

export default forwardRef(function Rank(
  { rank, colorByRank, style, className, ...props }: RankProps,
  ref: LegacyRef<SVGSVGElement>,
): ReactElement {
  const [id] = useState(`rank-${Math.random().toString(36).substring(7)}`);

  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      className={classNames('w-8 h-8', className)}
      style={
        colorByRank
          ? ({
              ...style,
              '--stop-color1': `var(--theme-rank-${rank}-color-bottom)`,
              '--stop-color2': `var(--theme-rank-${rank}-color-top)`,
            } as CSSProperties)
          : style
      }
    >
      <defs>
        <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id={id}>
          <stop stopColor="var(--stop-color1)" offset="0%" />
          <stop stopColor="var(--stop-color2)" offset="100%" />
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {rankPaths[rank > 0 ? rank - 1 : 0](`url(#${id})`)}
      </g>
    </svg>
  );
});
