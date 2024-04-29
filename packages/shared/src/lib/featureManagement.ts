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
    logo: 'https://daily-now-res.cloudinary.com/image/upload/s--7RocpMdi--/q_auto/v1714401089/feature-theme/sw-logo-light',
    logoText:
      'https://daily-now-res.cloudinary.com/image/upload/s--KEtXuZmE--/q_auto/v1714401089/feature-theme/sw-logo-text-light',
    body: {
      background: `url('https://res.cloudinary.com/daily-now/image/upload/s--AyMCeVaQ--/f_auto/v1713647013/public/Star%20wars%20bg') 50% / contain, var(--theme-background-default)`,
      'background-blend-mode': 'difference, normal',
    },
    navbar: '!border-[var(--theme-surface-primary)]',
  },
  dark: {
    logo: 'https://daily-now-res.cloudinary.com/image/upload/s--M8Oh5ojp--/q_auto/v1714401089/feature-theme/sw-logo-dark',
    logoText:
      'https://daily-now-res.cloudinary.com/image/upload/s--ovb1rR2S--/q_auto/v1714401089/feature-theme/sw-logo-text-dark',
    body: {
      background: `url('https://res.cloudinary.com/daily-now/image/upload/s--AyMCeVaQ--/f_auto/v1713647013/public/Star%20wars%20bg') 50% / contain, var(--theme-background-default)`,
    },
    navbar: '!border-[#fae610]',
  },
  cursor:
    'https://daily-now-res.cloudinary.com/image/upload/s--HrncIFqV--/q_auto/v1714401157/feature-theme/cursor_purple',
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
  featureTheme: new Feature('feature_theme', eTheme),
};

export { feature };
