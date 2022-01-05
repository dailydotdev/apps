import { IFlags } from 'flagsmith';

export class Features {
  static readonly SignupButtonCopy = new Features(
    'SignupButtonCopy',
    'signup_button_copy',
    'Access all features',
  );

  static readonly DevcardLimit = new Features(
    'DevcardLimit',
    'feat_limit_dev_card',
  );

  static readonly FeedVersion = new Features(
    'FeedVersion',
    'feed_version',
    '1',
  );

  static readonly HidePublicationDate = new Features(
    'HidePublicationDate',
    'hide_publication_date',
    '0',
  );

  static readonly LoginModalButtonCopyPrefix = new Features(
    'LoginModalButtonCopyPrefix',
    'login_modal_button_copy_prefix',
    'Sign in with',
  );

  static readonly LoginModalDescriptionCopy = new Features(
    'LoginModalDescriptionCopy',
    'login_modal_description_copy',
    'Unlock useful features by signing in. A bunch of cool stuff like content filters and bookmarks are waiting just for you.',
  );

  private constructor(
    private readonly key: string,
    public readonly id: string,
    public readonly defaultValue?: string,
  ) {}

  toString(): string {
    return this.key;
  }
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
