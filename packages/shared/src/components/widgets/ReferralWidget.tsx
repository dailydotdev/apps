import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { link } from '../../lib/links';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { labels } from '../../lib';
import { AnalyticsEvent, TargetId } from '../../lib/analytics';
import ReferralSocialShareButtons from './ReferralSocialShareButtons';

const ReferralWidget = ({ url }: { url: string }): ReactElement => {
  const inviteLink = url || link.referral.defaultUrl;
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    text: labels.referral.generic.inviteText,
    link: inviteLink,
    trackObject: () => ({
      event_name: AnalyticsEvent.CopyReferralLink,
      target_id: TargetId.ProfilePage,
    }),
  });

  return (
    <div
      data-testid="referral-widget"
      className="flex laptopL:absolute laptopL:left-full flex-col tablet:flex-row laptopL:flex-col flex-wrap justify-between p-4 laptopL:m-6 mt-6 laptopL:mt-0 mb-4 laptopL:max-w-widget laptopL:h-auto rounded-2xl border border-theme-divider-tertiary max-w-fit bg-theme-bg-primary"
    >
      <h3 className="mb-2 font-bold typo-title3">Invite friends</h3>
      <p className="text-theme-label-secondary typo-callout">
        Tell your dev friends how easy is it to learn, collaborate, and grow
        together
      </p>
      <TextField
        name="inviteURL"
        inputId="inviteURL"
        label="Your unique invite URL"
        autoComplete="off"
        type="url"
        value={inviteLink}
        fieldType="tertiary"
        className={{
          input: 'typo-footnote',
          container: 'flex flex-col my-5 w-auto tablet:w-70',
        }}
        actionButton={
          <Button
            buttonSize={ButtonSize.XSmall}
            className="btn-primary"
            onClick={() => onShareOrCopyLink()}
          >
            Copy link
          </Button>
        }
        readOnly
      />
      <div className="flex justify-between items-center">
        <p className="mr-3 typo-callout text-theme-label-tertiary">
          Invite with
        </p>
        <span className="flex gap-2">
          <ReferralSocialShareButtons url={url} />
        </span>
      </div>
    </div>
  );
};

export default ReferralWidget;
