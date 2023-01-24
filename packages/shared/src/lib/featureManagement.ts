import { IFlags } from 'flagsmith';
import { OnboardingStep } from '../components/onboarding/common';
import {
  OnboardingFiltersLayout as OnboardingFiltersLayoutEnum,
  InAppNotificationPosition as InAppNotificationPositionEnum,
  ScrollOnboardingVersion,
} from './featureValues';

export type FeatureValue = string | number | boolean;

export class Features<T extends FeatureValue = string> {
  static readonly SignupButtonCopy = new Features(
    'signup_button_copy',
    'Access all features',
  );

  static readonly FeedVersion = new Features('feed_version', '1');

  static readonly LoginModalButtonCopyPrefix = new Features(
    'login_modal_button_copy_prefix',
    'Connect with',
  );

  static readonly LoginModalDescriptionCopy = new Features(
    'login_modal_description_copy',
    'Unlock useful features by signing in. A bunch of cool stuff like content filters and bookmarks are waiting just for you.',
  );

  static readonly MyFeedButtonCopy = new Features(
    'my_feed_button_copy',
    'Choose tags',
  );

  static readonly SubmitArticleOn = new Features('submit_article_on');

  static readonly SubmitArticle = new Features('submit_article');

  static readonly SubmitArticleSidebarButton = new Features(
    'submit_article_sidebar_button',
    'Submit article',
  );

  static readonly SubmitArticleModalButton = new Features(
    'submit_article_modal_button',
    'Submit article',
  );

  static readonly MyFeedButtonColor = new Features(
    'my_feed_button_theme_color',
    'cabbage',
  );

  static readonly MyFeedExplainerCopy = new Features(
    'my_feed_explainer_copy',
    'Get the content you need by creating a personal feed',
  );

  static readonly MyFeedExplainerColor = new Features(
    'my_feed_explainer_theme_color',
    'cabbage',
  );

  static readonly SignupTitleCopy = new Features(
    'signup_title_copy',
    'Set up your profile',
  );

  static readonly HideSignupProfileImage = new Features(
    'hide_signup_profile_image',
  );

  static readonly SignupSubmitButtonCopy = new Features(
    'signup_submit_button_copy',
    'Finish',
  );

  static readonly SignupLogoutButtonCopy = new Features(
    'signup_logout_button_copy',
    'Logout',
  );

  static readonly PopularFeedCopy = new Features(
    'popular_feed_copy',
    'Popular',
  );

  static readonly PostCardHeadingFont = new Features(
    'post_card_heading_font',
    'title3Bold',
    ['bodyBold', 'body', 'title3', 'title3Bold'],
  );

  static readonly CompanionPermissionPlacement = new Features(
    'companion_permission_placement',
    'header',
    ['off', 'header', 'sidebar'],
  );

  static readonly CompanionPermissionTitle = new Features(
    'companion_permission_title',
    'Try the new companion feature!',
  );

  static readonly CompanionPermissionDescription = new Features(
    'companion_permission_description',
    "We'll ask for extra permissions so we can show the companion directly on an article!",
  );

  static readonly CompanionPermissionLink = new Features(
    'companion_permission_link',
    'Overview Video',
  );

  static readonly CompanionPermissionButton = new Features(
    'companion_permission_button',
    'Activate companion',
  );

  static readonly PostCardVersion = new Features('post_card_version', 'v1', [
    'v1',
    'v2',
  ]);

  static readonly PostModalByDefault = new Features('post_modal_by_default');

  static readonly PostEngagementNonClickable = new Features(
    'post_engagement_non_clickable',
  );

  static readonly OnboardingMinimumTopics = new Features<number>(
    'onboarding_minimum_topics',
    0,
  );

  static readonly OnboardingSteps = new Features(
    'onboarding_steps',
    `${OnboardingStep.Topics}/${OnboardingStep.Layout}/${OnboardingStep.Theme}`,
  );

  static readonly OnboardingFiltersLayout = new Features(
    'onboarding_filters_layout',
    OnboardingFiltersLayoutEnum.Grid,
    [OnboardingFiltersLayoutEnum.Grid, OnboardingFiltersLayoutEnum.List],
  );

  static readonly InAppNotificationPosition = new Features(
    'in_app_notification_position',
    InAppNotificationPositionEnum.Bottom,
    [InAppNotificationPositionEnum.Bottom, InAppNotificationPositionEnum.Top],
  );

  static readonly ShowCommentPopover = new Features('show_comment_popover');

  static readonly ScrollOnboardingVersion = new Features(
    'scroll_onboarding_version',
    null,
    [ScrollOnboardingVersion.V1, ScrollOnboardingVersion.V2],
  );

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
