import { IFlags } from 'flagsmith';
import { AdditionalInteractionButtons } from './featureValues';

export class Features {
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

  static readonly MyFeedOn = new Features('my_feed_on');

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

  static readonly MyFeedOnboardingVersion = new Features(
    'my_feed_onboarding_version',
    'control',
    ['control', 'v1', 'v2', 'v3'],
  );

  static readonly AdditionalInteractionButton = new Features(
    'additional_interaction_button',
    AdditionalInteractionButtons.Bookmark,
    [AdditionalInteractionButtons.Bookmark, AdditionalInteractionButtons.Share],
  );

  static readonly ShowCommentPopover = new Features('show_comment_popover');

  private constructor(
    public readonly id: string,
    public readonly defaultValue?: string,
    public readonly validTypes?: string[],
  ) {}
}

export const isFeaturedEnabled = (key: Features, flags: IFlags): boolean =>
  key?.validTypes === undefined ||
  key?.validTypes?.includes(<string>flags?.[key?.id]?.value)
    ? flags?.[key?.id]?.enabled
    : false;

export const getFeatureValue = (key: Features, flags: IFlags): string => {
  if (isFeaturedEnabled(key, flags)) {
    return <string>flags[key?.id].value;
  }

  return key?.defaultValue ?? undefined;
};
