import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SocialShareIcon } from './SocialShareIcon';
import CopyIcon from '../icons/Copy';
import {
  getEmailShareLink,
  getFacebookShareLink,
  getLinkedInShareLink,
  getRedditShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../../lib/share';
import TwitterIcon from '../icons/Twitter';
import WhatsappIcon from '../icons/Whatsapp';
import FacebookIcon from '../icons/Facebook';
import RedditIcon from '../icons/Reddit';
import LinkedInIcon from '../icons/LinkedIn';
import TelegramIcon from '../icons/Telegram';
import MailIcon from '../icons/Mail';
import MenuIcon from '../icons/Menu';
import { IconSize } from '../Icon';

interface SocialShareListProps {
  link: string;
  description: string;
  emailTitle?: string;
  isCopying?: boolean;
  onCopy?(): void;
  onNativeShare(): void;
  onClickSocial(provider: ShareProvider): void;
}

export function SocialShareList({
  link,
  emailTitle,
  description,
  isCopying,
  onCopy,
  onNativeShare,
  onClickSocial,
}: SocialShareListProps): ReactElement {
  return (
    <>
      {onCopy && (
        <SocialShareIcon
          onClick={onCopy}
          icon={
            <CopyIcon
              className={classNames('text-theme-label-invert')}
              secondary={isCopying}
            />
          }
          className="btn-primary"
          label={isCopying ? 'Copied!' : 'Copy link'}
        />
      )}
      <SocialShareIcon
        href={getTwitterShareLink(link, description)}
        icon={<TwitterIcon />}
        className="text-white bg-black"
        onClick={() => onClickSocial(ShareProvider.Twitter)}
        label="X"
      />
      <SocialShareIcon
        href={getWhatsappShareLink(link)}
        icon={<WhatsappIcon />}
        onClick={() => onClickSocial(ShareProvider.WhatsApp)}
        className="bg-theme-bg-whatsapp"
        label="WhatsApp"
      />
      <SocialShareIcon
        href={getFacebookShareLink(link)}
        icon={<FacebookIcon />}
        className="bg-theme-bg-facebook"
        onClick={() => onClickSocial(ShareProvider.Facebook)}
        label="Facebook"
      />
      <SocialShareIcon
        href={getRedditShareLink(link, description)}
        icon={<RedditIcon />}
        className="bg-theme-bg-reddit"
        onClick={() => onClickSocial(ShareProvider.Reddit)}
        label="Reddit"
      />
      <SocialShareIcon
        href={getLinkedInShareLink(link)}
        icon={<LinkedInIcon />}
        className="bg-theme-bg-linkedin"
        onClick={() => onClickSocial(ShareProvider.LinkedIn)}
        label="LinkedIn"
      />
      <SocialShareIcon
        href={getTelegramShareLink(link, description)}
        icon={<TelegramIcon />}
        className="bg-theme-bg-telegram"
        onClick={() => onClickSocial(ShareProvider.Telegram)}
        label="Telegram"
      />
      <SocialShareIcon
        href={getEmailShareLink(link, emailTitle ?? description)}
        icon={<MailIcon />}
        className="bg-theme-bg-email"
        onClick={() => onClickSocial(ShareProvider.Email)}
        label="Email"
      />
      {'share' in navigator && (
        <SocialShareIcon
          icon={<MenuIcon size={IconSize.Large} className="rotate-90" />}
          className="bg-theme-bg-email"
          onClick={onNativeShare}
          label="Share via..."
        />
      )}
    </>
  );
}
