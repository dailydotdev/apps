import { cloudinaryOnboardingExtensionVideo } from '../../../lib/image';
import { fromCDN } from '../../../lib/links';
import type { ExtensionShowcaseFeature } from './types';

const illustration = (
  id: string,
  alt: string,
): ExtensionShowcaseFeature['media'] => ({
  type: 'image',
  src: fromCDN(`/app/assets/extension-showcase/${id}.webp`),
  alt,
});

// Only what the extension adds on top of the web app, with the new-tab feed in
// the middle so the carousel opens on it and fans out to both sides, like the
// product tour on daily.dev's homepage (HomeProductTour in
// dailydotdev/recruiter-landing). Copy, accents and glows are copied from that
// tour by hand, so it and the illustrations need refreshing together whenever
// either surface changes; if the variant ships, the tour content should move
// to one shared source.
export const defaultExtensionShowcaseFeatures: ExtensionShowcaseFeature[] = [
  {
    id: 'readmode',
    label: 'Read it here',
    description:
      'Read any article inside daily.dev. The built-in browser opens it right there, with your actions one click away.',
    media: illustration('readmode', 'An article open in the daily.dev reader'),
    accent: '#38bdf8',
    glow: [
      {
        color: 'rgba(56,189,248,.24)',
        transform: 'translate(46%,-84%) scale(1.15)',
      },
      {
        color: 'rgba(59,130,246,.16)',
        transform: 'translate(-82%,44%) scale(1.2)',
      },
    ],
  },
  {
    id: 'brief',
    label: 'Daily brief',
    description:
      'Skip the scrolling. An AI brief compresses everything that matters in your feed into a two-minute read.',
    media: illustration('brief', 'The presidential briefing'),
    accent: '#8b5cf6',
    glow: [
      {
        color: 'rgba(139,92,246,.26)',
        transform: 'translate(-46%,-92%) scale(1.2)',
      },
      {
        color: 'rgba(99,102,241,.16)',
        transform: 'translate(-30%,58%) scale(1.15)',
      },
    ],
  },
  {
    id: 'most-visited',
    label: 'Most visited',
    description:
      'Your most-visited sites come straight from your browser, so the new tab still knows where you were headed. No setup.',
    media: illustration(
      'most-visited',
      'The new tab with your most visited sites',
    ),
    accent: '#FF9157',
    glow: [
      {
        color: 'rgba(255,145,87,.22)',
        transform: 'translate(-82%,-78%) scale(0.95)',
      },
      {
        color: 'rgba(255,131,61,.14)',
        transform: 'translate(72%,10%) scale(1.3)',
      },
    ],
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    description:
      'Pin the apps you live in, or import your bookmarks bar in a click, so your essentials stay one click from every tab.',
    media: illustration('shortcuts', 'The shortcuts settings'),
    accent: '#3b82f6',
    glow: [
      {
        color: 'rgba(59,130,246,.24)',
        transform: 'translate(46%,-84%) scale(1.15)',
      },
      {
        color: 'rgba(56,189,248,.16)',
        transform: 'translate(-82%,44%) scale(1.2)',
      },
    ],
  },
  {
    id: 'newtab',
    label: 'New tab feed',
    description:
      'Your whole dev world in one ranked feed, on every new tab. Only what is worth reading, none of the noise.',
    media: {
      type: 'video',
      src: cloudinaryOnboardingExtensionVideo,
      alt: 'A blank new tab turning into the daily.dev feed',
    },
    accent: '#7C6BEA',
    glow: [
      {
        color: 'rgba(124,107,234,.26)',
        transform: 'translate(-82%,-82%) scale(1.25)',
      },
      {
        color: 'rgba(34,211,238,.16)',
        transform: 'translate(48%,42%) scale(1.05)',
      },
    ],
  },
  {
    id: 'companion',
    label: 'Companion',
    description:
      'The companion rides along on any site you visit, adding an instant TLDR, what the community thinks, and related reads.',
    media: illustration('companion', 'The companion docked on an article'),
    accent: '#BA56E1',
    glow: [
      {
        color: 'rgba(186,86,225,.24)',
        transform: 'translate(-98%,-36%) scale(1.3)',
      },
      {
        color: 'rgba(147,51,234,.16)',
        transform: 'translate(66%,-64%) scale(0.95)',
      },
    ],
  },
  {
    id: 'streak',
    label: 'Reading streak',
    description:
      'daily.dev greets you every time you open a new tab, so keeping your reading streak alive takes zero willpower.',
    media: illustration('streak', 'The reading streak popup'),
    accent: '#F25D82',
    glow: [
      {
        color: 'rgba(242,93,130,.24)',
        transform: 'translate(68%,64%) scale(1.3)',
      },
      {
        color: 'rgba(255,145,87,.14)',
        transform: 'translate(-84%,-72%) scale(1.05)',
      },
    ],
  },
  {
    id: 'focus',
    label: 'Focus mode',
    description:
      'Need to focus? Pause the new tab for as long as you like and point it anywhere. Full control, in one click.',
    media: illustration('focus', 'The pause new tab dialog'),
    accent: '#6B56DD',
    glow: [
      {
        color: 'rgba(107,86,221,.24)',
        transform: 'translate(-82%,-82%) scale(1.25)',
      },
      {
        color: 'rgba(34,211,238,.14)',
        transform: 'translate(48%,42%) scale(1.05)',
      },
    ],
  },
];

export const defaultExtensionShowcaseFeatureId = 'newtab';

export const extensionShowcaseFeaturesWithVideo = (
  video: string,
): ExtensionShowcaseFeature[] =>
  defaultExtensionShowcaseFeatures.map((feature) =>
    feature.id === defaultExtensionShowcaseFeatureId
      ? { ...feature, media: { ...feature.media, src: video } }
      : feature,
  );
