import { IFlags } from 'flagsmith';

export class Features {
  static readonly SignupButtonCopy = new Features(
    'signup_button_copy',
    'Access all features',
  );

  static readonly SignupButtonColor = new Features(
    'signup_button_theme_color',
    'primary',
    ['primary', 'avocado', 'water', 'cabbage', 'bacon'],
  );

  static readonly DevcardLimit = new Features('feat_limit_dev_card', '50');

  static readonly FeedVersion = new Features('feed_version', '1');

  static readonly HidePublicationDate = new Features(
    'hide_publication_date',
    '0',
  );

  static readonly LoginModalButtonCopyPrefix = new Features(
    'login_modal_button_copy_prefix',
    'Sign in with',
  );

  static readonly LoginModalDescriptionCopy = new Features(
    'login_modal_description_copy',
    'Unlock useful features by signing in. A bunch of cool stuff like content filters and bookmarks are waiting just for you.',
  );

  static readonly MyFeedOn = new Features('my_feed_on');

  static readonly MyFeedPosition = new Features('my_feed_position', 'sidebar', [
    'sidebar',
    'feed_title',
    'feed_ad',
    'feed_top',
  ]);

  static readonly MyFeedButtonCopy = new Features(
    'my_feed_button_copy',
    'Create my feed',
  );

  static readonly MyFeedButtonColor = new Features(
    'my_feed_button_theme_color',
    'cabbage',
  );

  static readonly MyFeedExplainerCopy = new Features(
    'my_feed_explainer_copy',
    'Devs with a personal feed get 11.5x more relevant articles',
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
    'bodyBold',
    ['bodyBold', 'body', 'title3', 'title3Bold'],
  );

  private constructor(
    public readonly id: string,
    public readonly defaultValue?: string,
    public readonly validTypes?: string[],
  ) {}
}

export const isFeaturedEnabled = (key: Features, flags: IFlags): boolean =>
  key?.validTypes === undefined ||
  key?.validTypes?.includes(flags?.[key?.id]?.value)
    ? flags?.[key?.id]?.enabled
    : false;

export const getFeatureValue = (
  key: Features,
  flags: IFlags,
): string | undefined => {
  if (isFeaturedEnabled(key, flags)) {
    return flags[key?.id].value;
  }

  return key?.defaultValue ?? undefined;
};
