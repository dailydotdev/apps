import { IFlags } from 'flagsmith';

export class Features {
  static readonly SignupButtonCopy = new Features(
    'signup_button_copy',
    'Access all features',
  );

  static readonly DevcardLimit = new Features(
    'DevcardLimit',
    'feat_limit_dev_card',
  );

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

  static readonly MyFeedButtonCopy = new Features(
    'my_feed_button_copy',
    'Create my feed',
  );

  static readonly MyFeedButtonColor = new Features(
    'my_feed_button_color',
    'success',
  );

  static readonly MyFeedExplainerCopy = new Features(
    'my_feed_explainer_copy',
    'Devs with a personal feed get 11.5x more relevant articles',
  );

  static readonly MyFeedExplainerColor = new Features(
    'my_feed_explainer_color',
    'success',
  );

  private constructor(
    public readonly id: string,
    public readonly defaultValue?: string,
  ) {}
}

export const getFeatureValue = (
  key: Features,
  flags: IFlags,
): string | undefined => {
  if (flags[key?.id]?.enabled) {
    return flags[key?.id].value;
  }
  return key?.defaultValue ?? undefined;
};

export const isFeaturedEnabled = (key: Features, flags: IFlags): boolean =>
  flags[key]?.enabled;
