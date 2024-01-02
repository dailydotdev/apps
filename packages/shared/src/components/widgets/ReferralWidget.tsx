import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { link } from '../../lib/links';
import { TargetId, TargetType } from '../../lib/analytics';
import ReferralSocialShareButtons from './ReferralSocialShareButtons';
import { InviteLinkInput } from '../referral/InviteLinkInput';
import { addClassnameModifier } from '../../lib';

const ReferralWidget = ({ url }: { url: string }): ReactElement => {
  const inviteLink = url || link.referral.defaultUrl;

  const laptopCustomScreenClassNames = addClassnameModifier(
    '[@media(min-width:1410px)]',
    'absolute left-full flex-col m-6 mt-0 max-w-widget h-auto',
  );

  return (
    <div
      data-testid="referral-widget"
      className={classNames(
        'mb-4 mt-6 flex max-w-fit flex-col flex-wrap justify-between rounded-2xl border border-theme-divider-tertiary bg-theme-bg-primary p-4 tablet:flex-row',
        laptopCustomScreenClassNames,
      )}
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
          container: 'my-5 flex w-auto flex-col tablet:w-70',
        }}
      />
      <div className="flex items-center justify-between">
        <p className="mr-3 text-theme-label-tertiary typo-callout">
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
