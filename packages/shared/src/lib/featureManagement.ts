import { IFlags } from 'flagsmith';
import { OnboardingV2, OnboardingFilteringTitle } from './featureValues';

export type FeatureValue = string | number | boolean;

export class Features<T extends FeatureValue = string> {
  static readonly FeedVersion = new Features('feed_version', '1');

  static readonly SubmitArticle = new Features('submit_article');

  static readonly OnboardingV2 = new Features(
    'onboarding_v2',
    OnboardingV2.Control,
    [OnboardingV2.Control, OnboardingV2.V1],
  );

  static readonly OnboardingFilteringTitle = new Features(
    'onboarding_filtering_title',
    OnboardingFilteringTitle.Control,
    [
      OnboardingFilteringTitle.Control,
      OnboardingFilteringTitle.V1,
      OnboardingFilteringTitle.V2,
      OnboardingFilteringTitle.V3,
      OnboardingFilteringTitle.V4,
    ],
  );

  static readonly ShowHiring = new Features('show_hiring');

  private constructor(
    public readonly id: string,
    public readonly defaultValue?: T,
    public readonly validTypes?: T[],
  ) {}
}

export const isFeaturedEnabled = <T extends FeatureValue = string>(
  key: Features<T>,
  flags: IFlags,
): boolean =>
  key?.validTypes === undefined ||
  key?.validTypes?.includes(<T>flags?.[key?.id]?.value)
    ? flags?.[key?.id]?.enabled
    : false;

export const getFeatureValue = <T extends FeatureValue = string>(
  key: Features<T>,
  flags: IFlags,
): T => {
  if (isFeaturedEnabled(key, flags)) {
    return <T>flags[key?.id].value;
  }

  return key?.defaultValue ?? undefined;
};

export const getNumberValue = (
  value: string | number,
  defaultValue?: number,
): number => {
  if (typeof value === 'number') {
    return value;
  }

  try {
    const result = parseInt(value, 10);
    return result;
  } catch (err) {
    return defaultValue;
  }
};
