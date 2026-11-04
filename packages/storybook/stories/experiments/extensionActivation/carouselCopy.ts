import { defaultExtensionShowcaseFeatures } from '@dailydotdev/shared/src/components/onboarding/ExtensionShowcase/defaultFeatures';
import type { ExtensionShowcaseFeature } from '@dailydotdev/shared/src/components/onboarding/ExtensionShowcase/types';

export type VariantId = 'tour' | 'reassure';

export interface VariantCopy {
  label: string;
  headline: string;
  cta: string;
  defaultFeatureId: string;
  captions: Record<string, string>;
}

// Written for someone who already has the extension: what they have now, not
// what they would get. Most visited, the reader and the companion all sit
// behind optional permissions, so none of these promise "no setup".
const installedCaptions: Record<string, string> = {
  readmode:
    'Open any article and read it right here in the built-in browser, with your actions one click away.',
  brief:
    'Skip the scrolling. An AI brief compresses everything that matters in your feed into a two-minute read.',
  'most-visited':
    'Your most-visited sites can sit right on your new tab. Allow access once and your browser fills them in.',
  shortcuts:
    'Pin the apps you live in, or import your bookmarks bar in a click, so your essentials stay one click from every tab.',
  newtab:
    'This is your new tab now. Your whole dev world in one ranked feed, only what is worth reading, none of the noise.',
  companion:
    'Turn on the companion and it rides along on any site you visit, with an instant TLDR, what the community thinks, and related reads.',
  streak:
    'daily.dev greets you every time you open a new tab, so keeping your reading streak alive takes zero willpower.',
  focus:
    'Need to focus? Pause the new tab for as long as you like and point it anywhere. Full control, in one click.',
};

export const variants: Record<VariantId, VariantCopy> = {
  tour: {
    label: 'A. Welcome + tour',
    headline: "You're in. Here's what your new tab can do.",
    cta: 'Open my feed',
    defaultFeatureId: 'newtab',
    captions: installedCaptions,
  },
  reassure: {
    label: 'B. Your shortcuts first',
    headline: 'Your new tab just got better. Your shortcuts stay close.',
    cta: 'Open my feed',
    defaultFeatureId: 'most-visited',
    captions: {
      ...installedCaptions,
      'most-visited':
        'Your go-to sites are still a click away. Allow access once and your most-visited sites appear right on your new tab.',
      shortcuts:
        'Keep the apps you live in close. Pin them, or import your bookmarks bar in a click, and they follow you to every new tab.',
      focus:
        'Not in the mood for a feed? Pause the new tab for as long as you like and point it anywhere. Your browser, your call.',
    },
  },
};

export const featuresFor = (
  { captions }: VariantCopy,
  base: ExtensionShowcaseFeature[] = defaultExtensionShowcaseFeatures,
): ExtensionShowcaseFeature[] =>
  base.map((feature) => ({
    ...feature,
    description: captions[feature.id] ?? feature.description,
  }));
