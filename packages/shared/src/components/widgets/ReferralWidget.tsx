import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { link } from '../../lib/links';
import { TargetId, TargetType } from '../../lib/analytics';
import ReferralSocialShareButtons from './ReferralSocialShareButtons';
import { InviteLinkInput } from '../referral/InviteLinkInput';

const ReferralWidget = ({
  url,
  className,
}: {
  url: string;
  className?: string;
}): ReactElement => {
  const inviteLink = url || link.referral.defaultUrl;
  return (
    <div
      data-testid="referral-widget"
      className={classNames('flex flex-col px-6', className)}
    >
      <h3 className="mb-2 font-bold typo-title3">Invite friends</h3>
      <p className="text-theme-label-secondary typo-callout">
        Invite other developers to discover how easy it is to stay updated with
        daily.dev
      </p>
      <InviteLinkInput
        targetId={TargetId.ProfilePage}
        link={inviteLink}
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
