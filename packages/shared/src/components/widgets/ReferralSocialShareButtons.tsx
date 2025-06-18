import type { ReactElement } from 'react';
import React, { useContext } from 'react';
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
import type { TargetType } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import LogContext from '../../contexts/LogContext';
import { Tooltip } from '../tooltip/Tooltip';

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
          <Tooltip content={tooltip} key={tooltip}>
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
          </Tooltip>
        ),
      )}
    </>
  );
};

export default ReferralSocialShareButtons;
