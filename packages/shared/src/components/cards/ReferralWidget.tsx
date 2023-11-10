import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../../lib/share';
import WhatsappIcon from '../icons/Whatsapp';
import FacebookIcon from '../icons/Facebook';
import TwitterIcon from '../icons/Twitter';
import { TextField } from '../fields/TextField';
import { ReferralCampaignKey, useReferralCampaign } from '../../hooks';
import { link } from '../../lib/links';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { labels } from '../../lib';
import { AnalyticsEvent, TargetId } from '../../lib/analytics';
import { SimpleTooltip } from '../tooltips';

const ReferralWidget = (): ReactElement => {
  const { isReady, url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    text: labels.referral.generic.inviteText,
    link: inviteLink,
    trackObject: () => ({
      event_name: AnalyticsEvent.CopyReferralLink,
      target_id: TargetId.ProfilePage,
    }),
  });
  const onShareClick = () => {
    onShareOrCopyLink();
  };

  return (
    <div className="flex laptopL:absolute flex-col tablet:flex-row laptopL:flex-col flex-wrap justify-between p-4 laptopL:m-6 mt-6 laptopL:mt-0 mb-4 laptopL:max-w-widget laptopL:h-auto rounded-2xl border border-theme-divider-tertiary laptopL:left-[40rem] max-w-fit bg-theme-bg-primary">
      <h3 className="mb-2 font-bold typo-title3">Invite friends</h3>
      <p className="contents text-salt-50 typo-callout">
        Tell your dev friends how easy is it to learn, collaborate, and grow
        together
      </p>
      <div className="flex flex-col my-5 w-auto tablet:w-70">
        <TextField
          name="inviteURL"
          inputId="inviteURL"
          label="Your unique invite URL"
          autoComplete="off"
          type="url"
          value={inviteLink}
          fieldType="tertiary"
          className={{ input: 'typo-footnote' }}
          actionButton={
            <Button
              buttonSize={ButtonSize.XSmall}
              className="btn-primary"
              onClick={onShareClick}
              disabled={!isReady}
            >
              Copy link
            </Button>
          }
          readOnly
        />
      </div>
      <div className="flex justify-between items-center text-salt-90 typo-callout">
        Invite with
        <span className="flex">
          <SimpleTooltip content="Share on WhatsApp">
            <Button
              tag="a"
              href={getWhatsappShareLink(inviteLink)}
              target="_blank"
              rel="noopener"
              icon={<WhatsappIcon />}
              className="mr-2 ml-3 btn-tertiary"
              iconOnly
            />
          </SimpleTooltip>
          <SimpleTooltip content="Share on Facebook">
            <Button
              tag="a"
              href={getFacebookShareLink(inviteLink)}
              target="_blank"
              rel="noopener"
              icon={<FacebookIcon />}
              className="mr-2 btn-tertiary"
              iconOnly
            />
          </SimpleTooltip>
          <SimpleTooltip content="Share on X">
            <Button
              tag="a"
              href={getTwitterShareLink(
                inviteLink,
                labels.referral.generic.inviteText,
              )}
              target="_blank"
              rel="noopener"
              icon={<TwitterIcon />}
              className="btn-tertiary"
              iconOnly
            />
          </SimpleTooltip>
        </span>
      </div>
    </div>
  );
};

export default ReferralWidget;
