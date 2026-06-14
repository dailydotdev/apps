import React from 'react';
import {
  HomeIcon,
  TLDRIcon,
  EmbedIcon,
  ShortcutsIcon,
  ReadingStreakIcon,
  PauseIcon,
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

// Every item here answers "why the extension, not just the website?" — these
// are browser-level powers the webapp can't replicate (owning the new tab,
// injecting into other sites, reading browser top sites, pausing the new tab).
export const defaultExtensionShowcaseFeatures: ExtensionShowcaseFeature[] = [
  {
    id: 'feed',
    label: 'New tab feed',
    icon: <HomeIcon />,
    title: 'Every new tab becomes your dev briefing',
    description:
      'You open dozens of blank tabs a day. The extension turns each one into a feed tuned to your stack — so staying current happens in the gaps of your workday, with zero effort.',
    media: {
      type: 'video',
      src: cloudinaryOnboardingActivationDemo,
      alt: 'daily.dev new tab feed in action',
    },
  },
  {
    id: 'companion',
    label: 'Companion',
    icon: <TLDRIcon />,
    title: 'Bring daily.dev onto any site you visit',
    description:
      'Reading a doc, a blog, or a Hacker News thread? The companion sidebar rides along on the page itself — instant TLDR, what the community thinks in the comments, and related reads. This is the one thing only the extension can do.',
    media: placeholderImage,
  },
  {
    id: 'read-here',
    label: 'Read it here',
    icon: <EmbedIcon />,
    title: 'Read articles without drowning in tabs',
    description:
      'Open any post right inside daily.dev instead of spawning yet another tab. Distraction-free reading with the discussion beside it — your browser stays clean.',
    media: placeholderImage,
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    icon: <ShortcutsIcon />,
    title: 'Your most-visited sites, pinned to every tab',
    description:
      'The extension pulls your top sites straight from the browser, so GitHub, your docs, and your dashboards stay one click away. Your muscle memory keeps working, even with daily.dev on the new tab.',
    media: placeholderImage,
  },
  {
    id: 'streak',
    label: 'Reading streak',
    icon: <ReadingStreakIcon />,
    title: 'A daily habit that builds itself',
    description:
      'Because daily.dev greets you on every new tab, keeping your streak alive takes no willpower. Show up, read one thing, stay sharp — day after day.',
    media: placeholderImage,
  },
  {
    id: 'focus',
    label: 'Focus mode',
    icon: <PauseIcon />,
    title: 'Heads-down? Pause it in one click',
    description:
      'Need to focus, or just want your blank tab back for a while? Pause the new tab for as long as you like and point it anywhere — full control, only because the extension owns the page.',
    media: placeholderImage,
  },
];
