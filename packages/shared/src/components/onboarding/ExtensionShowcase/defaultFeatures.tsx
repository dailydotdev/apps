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
    description:
      'Every new tab becomes a feed tuned to your stack, so staying current happens in the gaps of your day — with zero effort.',
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
    description:
      'Open any article inside daily.dev in a clean reader with the discussion beside it — no more graveyard of half-read tabs.',
    cta: 'Get the in-app reader',
    media: placeholderImage,
  },
  {
    id: 'brief',
    label: 'Daily brief',
    icon: <BriefIcon />,
    description:
      'Your first tab of the day opens to an AI-built brief that compresses everything that matters into a two-minute read.',
    cta: 'Get your daily brief',
    media: placeholderImage,
  },
  {
    id: 'most-visited',
    label: 'Most visited',
    icon: <SitesIcon />,
    description:
      'Your most-visited sites come straight from your browser, so the new tab still knows where you were headed — no setup.',
    cta: 'Bring my top sites back',
    media: placeholderImage,
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    icon: <ShortcutsIcon />,
    description:
      'Pin the apps you live in — or import your bookmarks bar in a click — so your essentials stay one click from every tab.',
    cta: 'Get my shortcuts everywhere',
    media: placeholderImage,
  },
  {
    id: 'companion',
    label: 'Companion',
    icon: <TLDRIcon />,
    description:
      'The companion rides along on any site you visit, adding an instant TLDR, what the community thinks, and related reads.',
    cta: 'Get the companion',
    media: placeholderImage,
  },
  {
    id: 'streak',
    label: 'Reading streak',
    icon: <ReadingStreakIcon />,
    description:
      'daily.dev greets you on every new tab, so keeping your reading streak alive takes no willpower.',
    cta: 'Start my reading streak',
    media: placeholderImage,
  },
  {
    id: 'focus',
    label: 'Focus mode',
    icon: <PauseIcon />,
    description:
      'Need to focus? Pause the new tab for as long as you like and point it anywhere — full control, in one click.',
    cta: 'Add daily.dev to my browser',
    media: placeholderImage,
  },
];
