import { searchPageUrl } from '@dailydotdev/shared/src/graphql/search';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { Author } from '@dailydotdev/shared/src/graphql/comments';

export interface CampaignConfig {
  title: string; // for SEO purposes
  description: string; // for SEO purposes
  image: string; // for SEO purposes
  redirectTo: string; // once the transaction was successful
}

// TODO: create a hook instead to also manage the default value
export const campaignConfig: Record<ReferralCampaignKey, CampaignConfig> = {
  search: {
    title: '',
    description: '',
    image: '',
    redirectTo: searchPageUrl,
  },
};

export interface JoinPageProps {
  token?: string;
  referringUser: Author;
  campaign: ReferralCampaignKey;
}
