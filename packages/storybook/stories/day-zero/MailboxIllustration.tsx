import type { ReactElement } from 'react';
import React from 'react';

// A soft plastic mailbox with its flag up, in the cabbage and onion purples of
// the daily.dev Charm illustrations. Drawn inline so it themes with the step.
export const MailboxIllustration = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <svg
    viewBox="0 0 240 200"
    className={className}
    role="img"
    aria-label="A mailbox with its flag raised"
  >
    <defs>
      <linearGradient id="mailbox-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#C2A3FF" />
        <stop offset="0.45" stopColor="#8F5CFA" />
        <stop offset="1" stopColor="#5223C2" />
      </linearGradient>
      <radialGradient id="mailbox-door" cx="0.38" cy="0.28" r="0.85">
        <stop offset="0" stopColor="#E7D8FF" />
        <stop offset="0.4" stopColor="#B08AFF" />
        <stop offset="1" stopColor="#6A35E0" />
      </radialGradient>
      <linearGradient id="mailbox-post" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4A21A8" />
        <stop offset="0.45" stopColor="#8B62F2" />
        <stop offset="1" stopColor="#3D1A8C" />
      </linearGradient>
      <linearGradient id="mailbox-flag" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FF9DB4" />
        <stop offset="0.5" stopColor="#FF4F78" />
        <stop offset="1" stopColor="#D41E56" />
      </linearGradient>
      <linearGradient id="mailbox-pole" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFB8C8" />
        <stop offset="0.5" stopColor="#FF5C82" />
        <stop offset="1" stopColor="#C81A4E" />
      </linearGradient>
      <linearGradient id="mailbox-handle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE9A8" />
        <stop offset="1" stopColor="#FFAE1A" />
      </linearGradient>
      <linearGradient id="mailbox-letter" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#E4DCF7" />
      </linearGradient>
      <filter id="mailbox-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter id="mailbox-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
    </defs>

    <ellipse
      cx="128"
      cy="188"
      rx="74"
      ry="7"
      fill="#000"
      opacity="0.35"
      filter="url(#mailbox-blur)"
    />

    <rect
      x="124"
      y="140"
      width="22"
      height="50"
      rx="6"
      fill="url(#mailbox-post)"
    />
    <rect
      x="130"
      y="146"
      width="4"
      height="38"
      rx="2"
      fill="#FFF"
      opacity="0.3"
      filter="url(#mailbox-soft)"
    />

    <path
      d="M72 62H192A28 28 0 0 1 220 90V140Q220 150 210 150H72Z"
      fill="url(#mailbox-side)"
    />
    <rect
      x="84"
      y="69"
      width="112"
      height="9"
      rx="4.5"
      fill="#FFF"
      opacity="0.45"
      filter="url(#mailbox-soft)"
    />
    <rect
      x="84"
      y="138"
      width="128"
      height="8"
      rx="4"
      fill="#2E0F7A"
      opacity="0.35"
      filter="url(#mailbox-soft)"
    />

    <rect
      x="180"
      y="32"
      width="8"
      height="90"
      rx="4"
      fill="url(#mailbox-pole)"
    />
    <path
      d="M186 32H218Q225 32 225 39V52Q225 59 218 59H186Z"
      fill="url(#mailbox-flag)"
    />
    <rect
      x="190"
      y="36"
      width="26"
      height="5"
      rx="2.5"
      fill="#FFF"
      opacity="0.5"
      filter="url(#mailbox-soft)"
    />
    <circle cx="184" cy="120" r="8" fill="url(#mailbox-pole)" />
    <circle cx="182" cy="117.5" r="2.5" fill="#FFF" opacity="0.6" />

    <g transform="rotate(-14 74 52)">
      <rect
        x="46"
        y="28"
        width="56"
        height="38"
        rx="6"
        fill="url(#mailbox-letter)"
      />
      <path
        d="M49 32L74 50L99 32"
        fill="none"
        stroke="#C7B5F0"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="91" cy="57" r="4" fill="#CE3DF3" />
    </g>

    <path
      d="M38 146V96A34 34 0 0 1 106 96V146Q106 152 100 152H44Q38 152 38 146Z"
      fill="#3F1699"
      transform="translate(5 3)"
    />
    <path
      d="M38 146V96A34 34 0 0 1 106 96V146Q106 152 100 152H44Q38 152 38 146Z"
      fill="url(#mailbox-door)"
    />
    <path
      d="M46 143V97A26 26 0 0 1 98 97V143"
      fill="none"
      stroke="#FFF"
      strokeWidth="2"
      opacity="0.3"
    />
    <ellipse
      cx="58"
      cy="86"
      rx="12"
      ry="6"
      fill="#FFF"
      opacity="0.55"
      transform="rotate(-35 58 86)"
      filter="url(#mailbox-soft)"
    />
    <rect
      x="62"
      y="68"
      width="20"
      height="8"
      rx="4"
      fill="url(#mailbox-handle)"
    />

    <path
      d="M208 10L210.5 17.5L218 20L210.5 22.5L208 30L205.5 22.5L198 20L205.5 17.5Z"
      fill="#FFD966"
    />
    <path
      d="M232 64L233.5 68.5L238 70L233.5 71.5L232 76L230.5 71.5L226 70L230.5 68.5Z"
      fill="#CE3DF3"
    />
    <path
      d="M24 70L25.5 74.5L30 76L25.5 77.5L24 82L22.5 77.5L18 76L22.5 74.5Z"
      fill="#FFD966"
      opacity="0.8"
    />
  </svg>
);
