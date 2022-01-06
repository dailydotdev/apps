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

  static readonly SignupModalTitleCopy = new Features(
    'signup_modal_title_copy',
    'Set up your profile',
  );

  static readonly HideSignupModalProfileImage = new Features(
    'hide_signup_modal_profile_image',
    '0',
  );

  static readonly SignupModalSubmitButtonCopy = new Features(
    'signup_modal_submit_button_copy',
    'Finish',
  );

  static readonly SignupModalLogoutButtonCopy = new Features(
    'signup_modal_logout_button_copy',
    'Logout',
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
