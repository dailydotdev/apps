import React from 'react';
import {
  BriefIcon,
  EmbedIcon,
  HomeIcon,
  SitesIcon,
  ShortcutsIcon,
  TLDRIcon,
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

// Ordered by install pull. Lead with the new-tab feed (what the extension is),
// then reading inside daily.dev, the daily brief, the two shortcut flavors, the
// companion, and the rest. Every item leans on something the extension does
// that the website alone can't.
export const defaultExtensionShowcaseFeatures: ExtensionShowcaseFeature[] = [
  {
    id: 'feed',
    label: 'New tab feed',
    icon: <HomeIcon />,
    title: 'Every new tab becomes your dev briefing',
    description:
      'You open dozens of blank tabs a day. The extension turns each one into a feed tuned to your stack — so staying current happens in the gaps of your workday, with zero effort.',
    cta: 'Get daily.dev on every new tab',
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
    title: 'Read any article right inside daily.dev',
    description:
      'No more graveyard of half-read tabs. Open links inside daily.dev in a clean reader with the discussion right beside them, and close the loop without ever leaving your feed.',
    cta: 'Get the in-app reader',
    media: placeholderImage,
  },
  {
    id: 'brief',
    label: 'Daily brief',
    icon: <BriefIcon />,
    title: 'Your brief opens itself, the moment you start your day',
    description:
      'No inbox to dig through, no app to open. The first new tab of your day greets you with a brief built just for you — an AI agent reads the dev world overnight (releases, discussions, hot takes) and compresses what actually matters into a two-minute read. You stop trying to keep up, because it already did.',
    cta: 'Get your daily brief',
    media: placeholderImage,
  },
  {
    id: 'most-visited',
    label: 'Most visited',
    icon: <SitesIcon />,
    title: 'Your most-visited sites, right where you left them',
    description:
      'daily.dev pulls the sites you open most straight from your browser, so the new tab still knows where you were headed. No setup, nothing to relearn.',
    cta: 'Bring my top sites back',
    media: placeholderImage,
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    icon: <ShortcutsIcon />,
    title: 'Pin the apps and tools you live in',
    description:
      'Add your own shortcuts to GitHub, Jira, your docs — or import your whole bookmarks bar in a click. Your essentials stay one click from every new tab, and nothing leaves your browser.',
    cta: 'Get my shortcuts everywhere',
    media: placeholderImage,
  },
  {
    id: 'companion',
    label: 'Companion',
    icon: <TLDRIcon />,
    title: 'Bring daily.dev onto any site you visit',
    description:
      'Reading a doc, a blog, or a Hacker News thread? The companion sidebar rides along on the page itself — instant TLDR, what the community thinks in the comments, and related reads. This is the one thing only the extension can do.',
    cta: 'Get the companion',
    media: placeholderImage,
  },
  {
    id: 'streak',
    label: 'Reading streak',
    icon: <ReadingStreakIcon />,
    title: 'A daily habit that builds itself',
    description:
      'Because daily.dev greets you on every new tab, keeping your streak alive takes no willpower. Show up, read one thing, stay sharp — day after day.',
    cta: 'Start my reading streak',
    media: placeholderImage,
  },
  {
    id: 'focus',
    label: 'Focus mode',
    icon: <PauseIcon />,
    title: 'Heads-down? Pause it in one click',
    description:
      'Need to focus, or just want your blank tab back for a while? Pause the new tab for as long as you like and point it anywhere — full control, only because the extension owns the page.',
    cta: 'Add daily.dev to my browser',
    media: placeholderImage,
  },
];
