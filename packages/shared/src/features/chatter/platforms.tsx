import type { ReactElement } from 'react';
import React from 'react';
import { ChatterPlatform } from './types';

export interface PlatformVisual {
  label: string;
  // The card's left stripe + icon chip color. X uses a theme-aware token class
  // (black-on-light / white-on-dark) since its brand is monochrome; HN and
  // Reddit use raw brand hex — deliberately not design-system tokens, because
  // they must match each platform's real identity.
  chipClassName?: string;
  chipColor?: string;
  markClassName?: string;
  mark: ReactElement;
}

const XMark = (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="currentColor"
    aria-hidden
  >
    <path d="M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L5.3 22H2l7.7-8.8L1.5 2h6.8l4.7 6.2z" />
  </svg>
);

const HackerNewsMark = (
  <span className="font-bold text-white" style={{ fontSize: 15 }}>
    Y
  </span>
);

const RedditMark = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" aria-hidden>
    <circle cx="8.5" cy="13" r="1.4" />
    <circle cx="15.5" cy="13" r="1.4" />
    <circle cx="18" cy="7" r="1.6" />
    <path
      d="M8.5 16.2c1 .8 2.2 1.1 3.5 1.1s2.5-.3 3.5-1.1"
      stroke="#fff"
      strokeWidth="1.3"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const platformVisuals: Record<ChatterPlatform, PlatformVisual> = {
  [ChatterPlatform.X]: {
    label: 'X',
    chipClassName: 'bg-text-primary',
    markClassName: 'text-background-default',
    mark: XMark,
  },
  [ChatterPlatform.HackerNews]: {
    label: 'Hacker News',
    chipColor: '#ff6600',
    mark: HackerNewsMark,
  },
  [ChatterPlatform.Reddit]: {
    label: 'Reddit',
    chipColor: '#ff4500',
    mark: RedditMark,
  },
};
