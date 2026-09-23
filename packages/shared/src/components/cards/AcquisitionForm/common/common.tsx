import { AcquisitionChannel } from '../../../../graphql/users';

export const ACQUISITION_FORM_OPTIONS = [
  {
    label: 'Referred by a friend or colleague',
    value: AcquisitionChannel.Friend,
  },
  { label: 'X (Twitter)', value: AcquisitionChannel.X },
  { label: 'Reddit', value: AcquisitionChannel.Reddit },
  { label: 'LinkedIn', value: AcquisitionChannel.LinkedIn },
  {
    label: 'Instagram or Facebook',
    value: AcquisitionChannel.InstagramFacebook,
  },
  { label: 'YouTube', value: AcquisitionChannel.YouTube },
  { label: 'TikTok', value: AcquisitionChannel.TikTok },
  { label: 'Hacker News', value: AcquisitionChannel.HackerNews },
  { label: 'Search engine', value: AcquisitionChannel.SearchEngine },
  { label: 'AI search or chat, like ChatGPT', value: AcquisitionChannel.AI },
  {
    label: 'Browser extension store',
    value: AcquisitionChannel.ExtensionStore,
  },
  { label: 'A newsletter or blog', value: AcquisitionChannel.NewsletterBlog },
  {
    label: 'Advertisement or sponsorship',
    value: AcquisitionChannel.Advertisement,
  },
  { label: 'Other', value: AcquisitionChannel.Other },
];

export const acquisitionKey = 'ua';
