import React, { ReactElement, useContext } from 'react';
import { Button } from '../buttons/Button';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../../lib/share';
import WhatsappIcon from '../icons/Whatsapp';
import FacebookIcon from '../icons/Facebook';
import TwitterIcon from '../icons/Twitter';
import { link } from '../../lib/links';
import { labels } from '../../lib';
import { SimpleTooltip } from '../tooltips';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';

const ReferralSocialShareButtons = ({
  url,
  origin,
}: {
  url: string;
  origin: TargetType;
}): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const inviteLink = url || link.referral.defaultUrl;

  const socialShareButtonsDefaultConfig = {
    whatsapp: {
      icon: <WhatsappIcon />,
      tooltip: 'Share on WhatsApp',
      href: getWhatsappShareLink(inviteLink),
      shareProvider: ShareProvider.WhatsApp,
    },
    facebook: {
      icon: <FacebookIcon />,
      tooltip: 'Share on Facebook',
      href: getFacebookShareLink(inviteLink),
      shareProvider: ShareProvider.Facebook,
    },
    x: {
      icon: <TwitterIcon />,
      tooltip: 'Share on X',
      href: getTwitterShareLink(inviteLink, labels.referral.generic.inviteText),
      shareProvider: ShareProvider.Twitter,
    },
  };
  return (
    <>
      {Object.values(socialShareButtonsDefaultConfig).map(
        ({ tooltip, icon, href, shareProvider }) => (
          <SimpleTooltip content={tooltip} key={tooltip}>
            <Button
              icon={icon}
              href={href}
              className="btn-tertiary"
              target="_blank"
              rel="noopener"
              iconOnly
              tag="a"
              onClick={() => {
                trackEvent({
                  event_name: AnalyticsEvent.InviteReferral,
                  target_id: shareProvider,
                  target_type: origin,
                });
              }}
            />
          </SimpleTooltip>
        ),
      )}
    </>
  );
};

export default ReferralSocialShareButtons;
