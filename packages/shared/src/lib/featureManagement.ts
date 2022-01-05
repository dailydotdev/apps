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

export const getFeatureValue = (
  key: Features,
  flags: IFlags,
  defaultValue: string = undefined,
): string | undefined => {
  if (flags && flags[key]?.enabled) {
    return flags[key].value;
  }
  return defaultValue;
};
