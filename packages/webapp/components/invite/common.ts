import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { Author } from '@dailydotdev/shared/src/graphql/comments';

export interface JoinPageProps {
  token?: string;
  redirectTo?: string;
  referringUser: Author;
  campaign: ReferralCampaignKey;
}
