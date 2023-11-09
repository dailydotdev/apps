import React, { ReactElement } from 'react';
import { Card, CardTitle } from './Card';
import { Button, ButtonSize } from '../buttons/Button';
import { SocialShareIcon } from '../widgets/SocialShareIcon';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../../lib/share';
import WhatsappIcon from '../icons/Whatsapp';
import FacebookIcon from '../icons/Facebook';
import TwitterIcon from '../icons/Twitter';

const ReferralWidget = ({ link }: { link: string }): ReactElement => {
  const onReferralClick = () => {};

  return (
    <Card className="p-4 laptop:m-6 mt-6 mb-4 laptop:max-w-widget max-w-fit !bg-theme-bg-primary">
      <CardTitle>Invite friends</CardTitle>
      <p className="text-salt-50">
        Tell your dev friends how easy is it to learn, collaborate, and grow
        together
      </p>
      <div className="flex justify-between p-3 my-5 w-70 rounded-14 bg-theme-bg-secondary">
        <p className="my-auto w-40 truncate typo-callout">{link}</p>
        <Button className="btn-primary" buttonSize={ButtonSize.XSmall}>
          Copy link
        </Button>
      </div>
      <div className="flex justify-between items-center text-salt-90 typo-callout">
        Invite with
        <span className="flex">
          <SocialShareIcon
            href={getWhatsappShareLink(link)}
            icon={<WhatsappIcon tertiary />}
            onClick={() => onReferralClick(ShareProvider.WhatsApp)}
            ariaLabel="WhatsApp"
            size={ButtonSize.Medium}
            wrapperClassName="w-auto mr-2"
          />
          <SocialShareIcon
            href={getFacebookShareLink(link)}
            icon={<FacebookIcon tertiary />}
            onClick={() => onReferralClick(ShareProvider.Facebook)}
            ariaLabel="Facebook"
            size={ButtonSize.Medium}
            wrapperClassName="w-auto mr-2"
          />
          <SocialShareIcon
            href={getTwitterShareLink(link, 'Referral')}
            icon={<TwitterIcon tertiary />}
            onClick={() => onReferralClick(ShareProvider.Twitter)}
            ariaLabel="X"
            size={ButtonSize.Medium}
            wrapperClassName="w-auto"
          />
        </span>
      </div>
    </Card>
  );
};

export default ReferralWidget;
