import React, { ReactElement } from 'react';
import { link } from '../../lib/links';
import { TargetId, TargetType } from '../../lib/analytics';
import ReferralSocialShareButtons from './ReferralSocialShareButtons';
import { InviteLinkInput } from '../referral/InviteLinkInput';

const ReferralWidget = ({ url }: { url: string }): ReactElement => {
  const inviteLink = url || link.referral.defaultUrl;

  return (
    <div
      data-testid="referral-widget"
      className="flex laptopL:absolute laptopL:left-full flex-col tablet:flex-row laptopL:flex-col flex-wrap justify-between p-4 laptopL:m-6 mt-6 laptopL:mt-0 mb-4 laptopL:max-w-widget laptopL:h-auto rounded-2xl border border-theme-divider-tertiary max-w-fit bg-theme-bg-primary"
    >
      <h3 className="mb-2 font-bold typo-title3">Invite friends</h3>
      <p className="text-theme-label-secondary typo-callout">
        Invite other developers to discover how easy it is to stay updated with
        daily.dev
      </p>
      <InviteLinkInput
        targetId={TargetId.ProfilePage}
        link={inviteLink}
        text={{ copying: 'Copying...' }}
        className={{
          input: 'typo-footnote',
          container: 'flex flex-col my-5 w-auto tablet:w-70',
        }}
      />
      <div className="flex justify-between items-center">
        <p className="mr-3 typo-callout text-theme-label-tertiary">
          Invite via
        </p>
        <span className="flex gap-2">
          <ReferralSocialShareButtons
            url={url}
            targetType={TargetType.ProfilePage}
          />
        </span>
      </div>
    </div>
  );
};

export default ReferralWidget;
