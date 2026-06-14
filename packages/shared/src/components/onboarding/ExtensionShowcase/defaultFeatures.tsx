import React from 'react';
import {
  HomeIcon,
  SearchIcon,
  BookmarkIcon,
  TLDRIcon,
  ReadingStreakIcon,
  SquadIcon,
  ShortcutsIcon,
} from '../../icons';
import {
  cloudinaryOnboardingActivationDemo,
  cloudinaryOnboardingExtension,
} from '../../../lib/image';
import { BrowserName } from '../../../lib/func';
import type { ExtensionShowcaseFeature } from './types';

const screenshot = cloudinaryOnboardingExtension[BrowserName.Chrome];

// Real per-feature demo assets do not exist yet — these reuse the existing
// onboarding screenshot/video as placeholders. Swap `media` per feature once
// design delivers dedicated clips.
const placeholderImage: ExtensionShowcaseFeature['media'] = {
  type: 'image',
  src: screenshot.default,
  retinaSrc: screenshot.retina,
  alt: 'daily.dev extension preview',
};

export const defaultExtensionShowcaseFeatures: ExtensionShowcaseFeature[] = [
  {
    id: 'feed',
    label: 'New tab feed',
    icon: <HomeIcon />,
    title: 'Your personalized feed in every new tab',
    description:
      'Turn every new tab into a developer feed tuned to your stack. The moment you open your browser, the best content from across the dev world is already waiting for you.',
    media: {
      type: 'video',
      src: cloudinaryOnboardingActivationDemo,
      alt: 'daily.dev new tab feed in action',
    },
  },
  {
    id: 'search',
    label: 'AI search',
    icon: <SearchIcon />,
    title: 'Search the dev world, powered by AI',
    description:
      'Ask anything and get answers pulled from real developer content instead of generic results. Your AI co-pilot lives one tab away.',
    media: placeholderImage,
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    icon: <BookmarkIcon />,
    title: 'Save now, read when it clicks',
    description:
      'Bookmark any post in a click and pick it back up later on any device. Never lose that article you meant to get to.',
    media: placeholderImage,
  },
  {
    id: 'companion',
    label: 'Companion',
    icon: <TLDRIcon />,
    title: 'Read smarter with the companion',
    description:
      'The daily.dev companion rides along on any article, giving you an instant TLDR, the upvotes, and the discussion right on the page you are reading.',
    media: placeholderImage,
  },
  {
    id: 'streak',
    label: 'Reading streaks',
    icon: <ReadingStreakIcon />,
    title: 'Build a reading habit that sticks',
    description:
      'Keep your streak alive and stay sharp. A little every day adds up, and daily.dev keeps you coming back.',
    media: placeholderImage,
  },
  {
    id: 'squads',
    label: 'Squads',
    icon: <SquadIcon />,
    title: 'Find your people in Squads',
    description:
      'Join developer communities built around what you love. Share, learn, and grow alongside millions of developers.',
    media: placeholderImage,
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    icon: <ShortcutsIcon />,
    title: 'Your shortcuts, one tab away',
    description:
      'Pin the tools and sites you open every day so they are always a click away from your new tab.',
    media: placeholderImage,
  },
];
