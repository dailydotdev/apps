import type { ReactElement } from 'react';
import React from 'react';

export function NotificationSvg(): ReactElement {
  return (
    <svg
      viewBox="0 0 88 48"
      className="h-full w-full overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient
          id="notif-bg"
          x1="0"
          y1="0"
          x2="88"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1E1E1E" />
          <stop offset="1" stopColor="#121212" />
        </linearGradient>
      </defs>
      <style>
        {`
          @keyframes slideInRight {
            0% { transform: translateX(24px); opacity: 0; }
            15% { transform: translateX(0); opacity: 1; }
            85% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(24px); opacity: 0; }
          }
          @keyframes pulseGlow {
            0% { transform: scale(1); filter: drop-shadow(0 0 1px var(--accent-cabbage-default)); }
            50% { transform: scale(1.15); filter: drop-shadow(0 0 5px var(--accent-cabbage-default)); }
            100% { transform: scale(1); filter: drop-shadow(0 0 1px var(--accent-cabbage-default)); }
          }
          @keyframes pulseText {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
          .notif-box {
            animation: slideInRight 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
            transform-origin: center;
          }
          .notif-icon {
            animation: pulseGlow 2s ease-in-out infinite;
            transform-origin: 16px 16px;
          }
          .notif-text-glow {
            animation: pulseText 2s ease-in-out infinite;
          }
        `}
      </style>
      <g className="notif-box">
        <rect
          x="2"
          y="4"
          width="84"
          height="40"
          rx="8"
          fill="url(#notif-bg)"
          stroke="#333333"
          strokeWidth="1"
        />
        <circle
          cx="16"
          cy="16"
          r="6"
          className="notif-icon fill-accent-cabbage-default"
        />
        <rect
          x="28"
          y="12"
          width="32"
          height="4"
          rx="2"
          fill="#FFFFFF"
          className="notif-text-glow"
        />
        <rect x="28" y="20" width="48" height="3" rx="1.5" fill="#888888" />
        <rect x="28" y="26" width="36" height="3" rx="1.5" fill="#666666" />
        <rect x="72" y="12" width="8" height="3" rx="1.5" fill="#555555" />
      </g>
    </svg>
  );
}
