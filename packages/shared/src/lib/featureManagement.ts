import { IFlags } from 'flagsmith';

export enum Features {
  MyFeedOn = 'my_feed_on',
  MyFeedButtonCopy = 'my_feed_button_copy',
  MyFeedButtonColor = 'my_feed_button_color',
  MyFeedExplainerCopy = 'my_feed_explainer_copy',
  MyFeedExplainerColor = 'my_feed_explainer_color',
  SignupButtonCopy = 'signup_button_copy',
  DevcardLimit = 'feat_limit_dev_card',
  FeedVersion = 'feed_version',
  HidePublicationDate = 'hide_publication_date',
}
const isBoolean = (val) => 'boolean' === typeof val;

export const getFeatureValue = (
  key: Features,
  flags: IFlags,
  defaultValue: boolean | string = undefined,
): string | undefined | boolean => {
  if (flags[key]?.enabled) {
    return isBoolean(defaultValue) ? true : flags[key].value;
  }

  return defaultValue;
};
