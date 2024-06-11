import React, { ReactElement, useContext } from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../../lib/share';
import { TwitterIcon, FacebookIcon, WhatsappIcon } from '../icons';
import { link } from '../../lib/links';
import { labels } from '../../lib';
import { SimpleTooltip } from '../tooltips';
import { LogEvent, TargetType } from '../../lib/log';
import LogContext from '../../contexts/LogContext';

interface ReferralSocialShareButtonsProps {
  url: string;
  targetType: TargetType;
}
const ReferralSocialShareButtons = ({
  url,
  targetType,
}: ReferralSocialShareButtonsProps): ReactElement => {
  const { logEvent } = useContext(LogContext);
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
              variant={ButtonVariant.Tertiary}
              target="_blank"
              rel="noopener"
              tag="a"
              onClick={() => {
                logEvent({
                  event_name: LogEvent.InviteReferral,
                  target_id: shareProvider,
                  target_type: targetType,
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
