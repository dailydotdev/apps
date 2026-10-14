import type { ComponentType, ReactElement } from 'react';
import React, { useId } from 'react';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import Icon from '@dailydotdev/shared/src/components/Icon';
import { RaiseHandIcon } from '@dailydotdev/shared/src/components/icons/RaiseHand';
import { MergeIcon } from '@dailydotdev/shared/src/components/icons/Merge';
import { JoystickIcon } from '@dailydotdev/shared/src/components/icons/Joystick';

// Concept sketches for the LFG mark. Stroke drawings on the 24px grid, for
// picking a direction; the chosen one gets drawn properly in the icon set.

type Svg = ComponentType<{ className?: string }>;

const sketch =
  (paths: ReactElement, weight: number): Svg =>
  // eslint-disable-next-line react/display-name
  ({ className }) =>
    (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {paths}
      </svg>
    );

const icon =
  (outlined: Svg, filled: Svg) =>
  // eslint-disable-next-line react/display-name
  (props: IconProps): ReactElement =>
    <Icon {...props} IconPrimary={outlined} IconSecondary={filled} />;

/* ------------------------------------------------------------------ eyes */

// The pointed almond of the WoW Looking for Group eye, which sets it apart
// from the round "views" eye already in the icon set.
const almond =
  'M2 12C4.8 7.4 8.2 5 12 5s7.2 2.4 10 7c-2.8 4.6-6.2 7-10 7s-7.2-2.4-10-7Z';
const irisHole = 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z';

export const SeekerEyeIcon = icon(
  sketch(
    <>
      <path d={almond} />
      <circle cx="12" cy="12" r="3.6" />
      <ellipse
        cx="12"
        cy="12"
        rx="1"
        ry="2.3"
        fill="currentColor"
        stroke="none"
      />
    </>,
    1.8,
  ),
  sketch(
    <>
      <path d={`${almond}${irisHole}`} fill="currentColor" fillRule="evenodd" />
      <ellipse
        cx="12"
        cy="12"
        rx="1.2"
        ry="2.6"
        fill="currentColor"
        stroke="none"
      />
    </>,
    1.8,
  ),
);

const brackets = 'M10.25 9.75 8 12l2.25 2.25M13.75 9.75 16 12l-2.25 2.25';

export const CodeEyeIcon = icon(
  sketch(
    <>
      <path d={almond} />
      <path d={brackets} />
    </>,
    1.8,
  ),
  sketch(
    <>
      <path d={almond} />
      <path d={brackets} />
    </>,
    2.5,
  ),
);

// The daily.dev mark (the logo's two chevrons) as the pupil.
const DailyMark = ({ fill }: { fill: string }): ReactElement => (
  <g transform="translate(7.2 9.3) scale(0.3)" stroke="none" fill={fill}>
    <path
      fillOpacity="0.64"
      d="M26.633 8.69l-3.424-3.431 1.711-3.43 5.563 5.575c.709.71.709 1.861 0 2.572l-6.847 6.86c-.709.711-1.858.711-2.567 0a1.821 1.821 0 010-2.571l5.564-5.575z"
    />
    <path d="M21.07.536a1.813 1.813 0 012.568 0l1.283 1.286L9.945 16.83c-.709.71-1.858.71-2.567 0l-1.284-1.287L21.071.536zm-6.418 4.717l-2.567 2.572-3.424-3.43-4.28 4.288 3.424 3.43-1.71 3.43L.531 9.97a1.821 1.821 0 010-2.572L7.378.537A1.813 1.813 0 019.945.535l4.707 4.717z" />
  </g>
);

const DailyEyeFilled: Svg = ({ className }) => {
  const maskId = `lfg-eye-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <DailyMark fill="black" />
        </mask>
      </defs>
      <path
        d={almond}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export const DailyEyeIcon = icon(
  sketch(
    <>
      <path d={almond} />
      <DailyMark fill="currentColor" />
    </>,
    1.8,
  ),
  DailyEyeFilled,
);

// The iris turns slowly, like the WoW eye spinning while you're queued. In
// the product it would only move while your own post is live.
const Spin = (): ReactElement => (
  <animateTransform
    attributeName="transform"
    type="rotate"
    from="0 12 12"
    to="360 12 12"
    dur="6s"
    repeatCount="indefinite"
  />
);

export const QueueEyeIcon = icon(
  sketch(
    <>
      <path d={almond} />
      <g>
        <circle cx="12" cy="12" r="3.8" strokeDasharray="3.2 2.2" />
        <Spin />
      </g>
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>,
    1.8,
  ),
  sketch(
    <>
      <path d={`${almond}${irisHole}`} fill="currentColor" fillRule="evenodd" />
      <g>
        <circle
          cx="12"
          cy="12"
          r="2.6"
          strokeWidth={1.3}
          strokeDasharray="2.2 1.4"
        />
        <Spin />
      </g>
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>,
    1.8,
  ),
);

const puzzlePath = 'M4 7h4a2.5 2.5 0 1 1 5 0h4v4a2.5 2.5 0 1 1 0 5v4H4z';

export const PuzzleIcon = icon(
  sketch(<path d={puzzlePath} />, 1.8),
  sketch(<path d={puzzlePath} fill="currentColor" />, 1.8),
);

const plusOne = (
  <>
    <rect x="3" y="5" width="18" height="14" rx="4" />
    <path d="M7 12h5M9.5 9.5v5M15 10.25 16.75 9v6.5" />
  </>
);

export const PlusOneIcon = icon(sketch(plusOne, 1.8), sketch(plusOne, 2.6));

const signal = (
  <>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
  </>
);

export const SignalIcon = icon(sketch(signal, 1.8), sketch(signal, 2.6));

export interface LfgIconOption {
  id: string;
  name: string;
  icon: ComponentType<IconProps>;
  existing: boolean;
  why: string;
  watchOut?: string;
}

export const lfgIconOptions: LfgIconOption[] = [
  {
    id: 'eye-seeker',
    name: 'Seeker eye',
    icon: SeekerEyeIcon,
    existing: false,
    why: "WoW's Looking for Group eye: pointed corners and a slit pupil, so it can't be mistaken for the round views eye we already use.",
    watchOut:
      'The slit pupil leans fantasy, and any eye can read as being watched.',
  },
  {
    id: 'eye-daily',
    name: 'daily.dev eye',
    icon: DailyEyeIcon,
    existing: false,
    why: 'The same eye with our own mark as the pupil. Nobody else can use it.',
    watchOut:
      'The mark disappears below 16px, so the small badge shows just the eye.',
  },
  {
    id: 'eye-queue',
    name: 'Queue eye (animated)',
    icon: QueueEyeIcon,
    existing: false,
    why: 'The iris turns slowly while your post is live, like the WoW eye spinning while you wait in the queue. Still otherwise.',
    watchOut:
      'Needs a reduced-motion fallback, and should only move on your own nav tab and avatar.',
  },
  {
    id: 'eye-code',
    name: 'Code eye',
    icon: CodeEyeIcon,
    existing: false,
    why: 'Brackets for a pupil: a developer looking for developers.',
    watchOut: 'Can read as "view source" or a code preview.',
  },
  {
    id: 'raise-hand',
    name: 'Raised hand (current)',
    icon: RaiseHandIcon,
    existing: true,
    why: '"I\'m in" or "pick me". Friendly and human.',
    watchOut:
      'Reads as volunteering more than looking, and is easy to confuse with the Help kind.',
  },
  {
    id: 'puzzle',
    name: 'Puzzle piece',
    icon: PuzzleIcon,
    existing: false,
    why: 'Finding the missing piece. Works for a co-founder, a study buddy and a mentor alike.',
    watchOut:
      "Chrome's extensions button is a puzzle piece, and we ship an extension.",
  },
  {
    id: 'plus-one',
    name: '+1',
    icon: PlusOneIcon,
    existing: false,
    why: 'Straight from "LF1M": looking for one more. Dev-native and readable at badge size.',
    watchOut: 'Close to upvote and "+1 reaction" language.',
  },
  {
    id: 'merge',
    name: 'Merge',
    icon: MergeIcon,
    existing: true,
    why: 'Two paths joining, in git terms. Instantly developer.',
    watchOut: 'Already used in squad analytics, and reads as a code action.',
  },
  {
    id: 'signal',
    name: 'Signal',
    icon: SignalIcon,
    existing: false,
    why: 'Broadcasting that you are open. Matches how the badge works.',
    watchOut: 'Looks like live, streaming or Wi-Fi.',
  },
  {
    id: 'joystick',
    name: 'Joystick',
    icon: JoystickIcon,
    existing: true,
    why: 'Nods to the gaming roots of "LFG".',
    watchOut:
      'Already the Game Center icon, and pushes the feature toward play.',
  },
];

// The mark the prototype uses everywhere: rail tab, avatar badge, strips.
export const LfgIcon = SignalIcon;
