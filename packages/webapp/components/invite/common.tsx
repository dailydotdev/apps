import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { Author } from '@dailydotdev/shared/src/graphql/comments';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import React, { ReactElement } from 'react';

export interface JoinPageProps {
  token?: string;
  redirectTo?: string;
  referringUser: Author;
  campaign: ReferralCampaignKey;
}

export const DailyDevLogo = (): ReactElement => {
  return (
    <span className="absolute top-8 left-1/2 laptop:left-12 -translate-x-1/2 laptop:translate-x-0">
      <Logo showGreeting={false} position={LogoPosition.Relative} />
    </span>
  );
};
