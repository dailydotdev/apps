import { AcquisitionChannel } from '../../../../graphql/users';

export const ACQUISITION_FORM_OPTIONS = [
  {
    label: 'Referred by a friend or colleague',
    value: AcquisitionChannel.Friend,
  },
  {
    label: 'Instagram or Facebook',
    value: AcquisitionChannel.InstagramFacebook,
  },
  { label: 'YouTube', value: AcquisitionChannel.YouTube },
  { label: 'TikTok', value: AcquisitionChannel.TikTok },
  { label: 'Search engine', value: AcquisitionChannel.SearchEngine },
  {
    label: 'Advertisement or sponsorship',
    value: AcquisitionChannel.Advertisement,
  },
  { label: 'Other', value: AcquisitionChannel.Other },
];

export const acquisitionKey = 'ua';
