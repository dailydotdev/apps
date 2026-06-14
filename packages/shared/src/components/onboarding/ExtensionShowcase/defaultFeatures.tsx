import React from 'react';
import {
  HomeIcon,
  EmbedIcon,
  TLDRIcon,
  SearchIcon,
  BookmarkIcon,
  ShortcutsIcon,
  ReadingStreakIcon,
  SquadIcon,
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

// Ordered for conversion: lead with what the extension *is* (the new tab),
// then the "aha" tab-saving and context features, then habit and community.
export const defaultExtensionShowcaseFeatures: ExtensionShowcaseFeature[] = [
  {
    id: 'feed',
    label: 'New tab feed',
    icon: <HomeIcon />,
    title: 'Every new tab becomes your dev briefing',
    description:
      'Stop staring at a blank page. Every new tab opens to a feed tuned to your stack, so you stay in the loop on the best dev content throughout your work routine — without ever going looking for it.',
    media: {
      type: 'video',
      src: cloudinaryOnboardingActivationDemo,
      alt: 'daily.dev new tab feed in action',
    },
  },
  {
    id: 'read-here',
    label: 'Read it here',
    icon: <EmbedIcon />,
    title: 'Read articles without the tab chaos',
    description:
      'Open any post right inside daily.dev instead of spawning yet another tab. Read distraction-free with the discussion right beside it, and keep your browser clean.',
    media: placeholderImage,
  },
  {
    id: 'companion',
    label: 'Companion',
    icon: <TLDRIcon />,
    title: 'Context on every article you read',
    description:
      'The daily.dev companion rides along on any site you visit. Get an instant TLDR, see what the community thinks in the comments, and surface more relevant articles — right on the page.',
    media: placeholderImage,
  },
  {
    id: 'search',
    label: 'AI search',
    icon: <SearchIcon />,
    title: 'Ask anything, get real dev answers',
    description:
      'Skip the SEO spam. daily.dev search only pulls from developer content the community has actually read and upvoted, so your answers come from sources you can trust.',
    media: placeholderImage,
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    icon: <BookmarkIcon />,
    title: 'Save now, read when it clicks',
    description:
      'Bookmark anything in a click and pick it back up later on any device. Never lose that article you meant to get to.',
    media: placeholderImage,
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    icon: <ShortcutsIcon />,
    title: 'Keep your shortcuts on every new tab',
    description:
      'Pin the tools and sites you open all day — GitHub, your docs, your dashboards — so they stay one click away and you never lose them when daily.dev takes over the new tab.',
    media: placeholderImage,
  },
  {
    id: 'streak',
    label: 'Reading streak',
    icon: <ReadingStreakIcon />,
    title: 'Keep your streak, keep your momentum',
    description:
      'With daily.dev in every new tab, staying sharp becomes automatic. Show up, keep your streak alive, and always find something worth reading.',
    media: placeholderImage,
  },
  {
    id: 'squads',
    label: 'Squads',
    icon: <SquadIcon />,
    title: 'Find your people in Squads',
    description:
      'Join developer communities built around the tools and topics you love. Share what you are learning and grow alongside millions of developers.',
    media: placeholderImage,
  },
];
