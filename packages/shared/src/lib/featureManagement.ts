import { IFlags } from 'flagsmith';

export enum Features {
  SignupButtonCopy = 'signup_button_copy',
  DevcardLimit = 'feat_limit_dev_card',
  FeedVersion = 'feed_version',
  HidePublicationDate = 'hide_publication_date',
}

export const getFeatureValue = (
  key: Features,
  flags: IFlags,
): string | undefined => {
  if (flags[key]?.enabled) {
    return flags[key].value;
  }
  return undefined;
};
