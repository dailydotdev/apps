import { JSONValue } from '@growthbook/growthbook';
import { ShortcutsUIExperiment } from './featureValues';
import { cloudinary } from './image';
import { SearchStyleVersion } from '../components/fields/SearchField';

export class Feature<T extends JSONValue> {
  readonly id: string;

  readonly defaultValue?: T;

  constructor(id: string, defaultValue?: T) {
    this.id = id;
    this.defaultValue = defaultValue;
  }
}

const feature = {
  showError: new Feature('show_error', false),
  feedVersion: new Feature('feed_version', 15),
  onboardingVisual: new Feature('onboarding_visual', {
    fullBackground: {
      mobile: cloudinary.onboarding.fullBackground.mobile,
      desktop: cloudinary.onboarding.fullBackground.desktop,
    },
  }),
  feedAdSpot: new Feature('feed_ad_spot', 2),
  searchVersion: new Feature('search_version', 2),
  featureTheme: new Feature('feature_theme', {}),
  shortcutsUI: new Feature('shortcuts_ui', ShortcutsUIExperiment.Control),
  showRoadmap: new Feature('show_roadmap', true),
  onboardingChecklist: new Feature('onboarding_checklist', true),
  searchUsers: new Feature('search_users', false),
  showCodeSnippets: new Feature('show_code_snippets', false),
  searchPlaceholder: new Feature('search_placeholder', 'Search'),
  onboardingShuffleTags: new Feature('onboarding_shuffle_tags', false),
  searchStyleVersion: new Feature(
    'search_style_version',
    SearchStyleVersion.Default,
  ),
  extensionOverlay: new Feature('onboarding_extension_overlay', false),
};

export { feature };
