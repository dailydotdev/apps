import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { link } from '../../lib/links';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
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
      className={classNames('flex flex-col px-4', className)}
    >
      <h3 className="mb-2 font-bold typo-title3">Invite friends</h3>
      <p className="text-text-secondary typo-callout">
        Invite other developers to discover how easy it is to stay updated with
        daily.dev
      </p>
      <InviteLinkInput
        logProps={{
          event_name: LogEvent.CopyReferralLink,
          target_id: TargetId.ProfilePage,
        }}
        link={inviteLink}
        className={{
          input: 'typo-footnote',
          container: 'my-5 flex flex-col',
        }}
      />
      <div className="flex items-center justify-between">
        <p className="mr-3 text-text-tertiary typo-callout">Invite via</p>
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
