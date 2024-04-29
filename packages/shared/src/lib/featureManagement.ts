import { JSONValue } from '@growthbook/growthbook';
import {
  ExperienceLevelExperiment,
  ReadingStreaksExperiment,
  TagSourceSocialProof,
} from './featureValues';
import { cloudinary } from './image';

export class Feature<T extends JSONValue> {
  readonly id: string;

  readonly defaultValue?: T;

  constructor(id: string, defaultValue?: T) {
    this.id = id;
    this.defaultValue = defaultValue;
  }
}

// TODO: keeping this here temporarily, so that we can see how it works in preview
const eTheme = {
  version: 1,
  light: {
    logo: 'https://res.cloudinary.com/daily-now/image/upload/s--sPHXHbbd--/f_auto/v1714049911/public/sw-logo',
    logoText:
      'https://res.cloudinary.com/daily-now/image/upload/s--t70tDZFe--/f_auto/v1714049911/public/sw-logo-text',
    body: {
      background: `url('https://res.cloudinary.com/daily-now/image/upload/s--AyMCeVaQ--/f_auto/v1713647013/public/Star%20wars%20bg') 50% / contain, var(--theme-background-default)`,
      'background-blend-mode': 'difference, normal',
      '--theme-starwars-primary': 'var(--theme-surface-primary)',
    },
    navbar: '!border-[var(--theme-starwars-primary)]',
  },
  dark: {
    logo: 'https://daily-now-res.cloudinary.com/image/upload/v1714049911/public/sw-logo.svg',
    logoText:
      'https://daily-now-res.cloudinary.com/image/upload/v1714049911/public/sw-logo-text.svg',
    body: {
      background: `url('https://res.cloudinary.com/daily-now/image/upload/s--AyMCeVaQ--/f_auto/v1713647013/public/Star%20wars%20bg') 50% / contain, var(--theme-background-default)`,
      '--theme-starwars-primary': '#fae610',
    },
    navbar: '!border-[var(--theme-starwars-primary)]',
  },
  cursor:
    'https://res.cloudinary.com/daily-now/image/upload/s--53WBJl29--/f_auto/v1714049911/public/cursor_optimized_crop',
};

const feature = {
  feedVersion: new Feature('feed_version', 15),
  lowImps: new Feature('feed_low_imps'),
  bookmarkOnCard: new Feature('bookmark_on_card', false),
  readingStreaks: new Feature(
    'reading_streaks',
    ReadingStreaksExperiment.Control,
  ),
  onboardingVisual: new Feature('onboarding_visual', {
    showCompanies: true,
    poster: cloudinary.onboarding.video.poster,
    webm: cloudinary.onboarding.video.webm,
    mp4: cloudinary.onboarding.video.mp4,
  }),
  forceRefresh: new Feature('force_refresh', false),
  feedAdSpot: new Feature('feed_ad_spot', 0),
  searchVersion: new Feature('search_version', 1),
  forcedTagSelection: new Feature('forced_tag_selection', false),
  readingReminder: new Feature('reading_reminder', false),
  onboardingMostVisited: new Feature('onboarding_most_visited', false),
  shareExperience: new Feature('share_experience', false),
  bookmarkLoops: new Feature('bookmark_loops', false),
  sidebarClosed: new Feature('sidebar_closed', false),
  tagSourceSocialProof: new Feature(
    'tag_source_social_proof',
    TagSourceSocialProof.Control,
  ),
  experienceLevel: new Feature(
    'experience_level',
    ExperienceLevelExperiment.Control,
  ),
  easterEggTheme: new Feature('easter_egg_theme', eTheme),
};

export { feature };
