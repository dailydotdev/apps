import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { Author } from '@dailydotdev/shared/src/graphql/comments';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { Feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { JSONValue } from '@growthbook/growthbook';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';

export interface JoinPageProps {
  token: string;
  referringUser: Author;
  campaign: ReferralCampaignKey;
}

export interface InviteComponentProps {
  referringUser: Author;
  campaign: ReferralCampaignKey;
  handleAcceptClick: () => void | Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  redirectTo: string;
}

export interface ComponentConfig {
  actionType: ActionType;
  feature?: Feature<JSONValue>;
  featureControl?: string;
  campaignKey: ReferralCampaignKey;
  authTrigger: AuthTriggers;
}
