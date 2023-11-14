import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../../lib/share';
import WhatsappIcon from '../icons/Whatsapp';
import FacebookIcon from '../icons/Facebook';
import TwitterIcon from '../icons/Twitter';
import { link } from '../../lib/links';
import { labels } from '../../lib';
import { SimpleTooltip } from '../tooltips';

const ReferralSocialShareButtons = ({ url }: { url: string }): ReactElement => {
  const inviteLink = url || link.referral.defaultUrl;

  const socialShareButtonsDefaultConfig = {
    whatsapp: {
      icon: <WhatsappIcon />,
      tooltip: 'Share on WhatsApp',
      href: getWhatsappShareLink(inviteLink),
    },
    facebook: {
      icon: <FacebookIcon />,
      tooltip: 'Share on Facebook',
      href: getFacebookShareLink(inviteLink),
    },
    x: {
      icon: <TwitterIcon />,
      tooltip: 'Share on X',
      href: getTwitterShareLink(inviteLink, labels.referral.generic.inviteText),
    },
  };
  return (
    <>
      {Object.values(socialShareButtonsDefaultConfig).map(
        ({ tooltip, icon, href }) => (
          <SimpleTooltip content={tooltip} key={tooltip}>
            <Button
              icon={icon}
              href={href}
              className="btn-tertiary"
              target="_blank"
              rel="noopener"
              iconOnly
              tag="a"
            />
          </SimpleTooltip>
        ),
      )}
    </>
  );
};

export default ReferralSocialShareButtons;
