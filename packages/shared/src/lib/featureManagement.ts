import { IFlags } from 'flagsmith';

export enum Features {
  SignupButtonCopy = 'signup_button_copy',
  DevcardLimit = 'feat_limit_dev_card',
  FeedVersion = 'feed_version',
  HidePublicationDate = 'hide_publication_date',
  LoginModalButtonCopyPrefix = 'login_modal_button_copy_prefix',
  LoginModalDescriptionCopy = 'login_modal_description_copy',
}

export const getFeatureValue = (
  key: Features,
  flags: IFlags,
  defaultValue: string = undefined,
): string | undefined => {
  if (flags[key]?.enabled) {
    return flags[key].value;
  }
  return defaultValue;
};
