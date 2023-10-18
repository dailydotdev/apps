import { Author } from '../../graphql/comments';
import { ReferralCampaignKey } from './useReferralCampaign';
import { CampaignConfig } from '../../graphql/features';

interface UseReferralConfigProps {
  campaign: string;
  referringUser: Author;
}

export const useReferralConfig = ({
  campaign,
  referringUser,
}: UseReferralConfigProps): CampaignConfig => {
  const getDefaultTitle = () =>
    `${referringUser.name} invites you to use daily.dev`;
  const getDefaultDescription = () =>
    `daily dev is a professional network for developers to learn, collaborate, and grow together. Developers come to daily.dev to discover a wide variety of professional knowledge, create groups where they can collaborate with other developers they appreciate, and discuss the latest trends in the developer ecosystem.`;
  const getDefaultImages = () => [
    { url: `https://og.daily.dev/api/refs/${referringUser.id}` },
  ];

  if (campaign === ReferralCampaignKey.Search) {
    return {
      title: getDefaultTitle(),
      description: getDefaultDescription(),
      images: getDefaultImages(),
      redirectTo: '/my-feed',
    };
  }

  return {
    title: getDefaultTitle(),
    description: getDefaultDescription(),
    images: getDefaultImages(),
    redirectTo: '/',
  };
};
