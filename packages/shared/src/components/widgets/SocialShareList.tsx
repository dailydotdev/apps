import React, { ReactElement } from 'react';
import { SocialShareButton } from './SocialShareButton';
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
import {
  MenuIcon,
  MailIcon,
  TelegramIcon,
  LinkedInIcon,
  RedditIcon,
  FacebookIcon,
  WhatsappIcon,
  CopyIcon,
  TwitterIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { ButtonColor, ButtonVariant } from '../buttons/Button';

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
        <SocialShareButton
          onClick={onCopy}
          icon={<CopyIcon secondary={isCopying} />}
          variant={ButtonVariant.Primary}
          label={isCopying ? 'Copied!' : 'Copy link'}
        />
      )}
      <SocialShareButton
        href={getTwitterShareLink(link, description)}
        icon={<TwitterIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Twitter}
        onClick={() => onClickSocial(ShareProvider.Twitter)}
        label="X"
      />
      <SocialShareButton
        href={getWhatsappShareLink(link)}
        icon={<WhatsappIcon />}
        onClick={() => onClickSocial(ShareProvider.WhatsApp)}
        variant={ButtonVariant.Primary}
        color={ButtonColor.WhatsApp}
        label="WhatsApp"
      />
      <SocialShareButton
        href={getFacebookShareLink(link)}
        icon={<FacebookIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Facebook}
        onClick={() => onClickSocial(ShareProvider.Facebook)}
        label="Facebook"
      />
      <SocialShareButton
        href={getRedditShareLink(link, description)}
        icon={<RedditIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Reddit}
        onClick={() => onClickSocial(ShareProvider.Reddit)}
        label="Reddit"
      />
      <SocialShareButton
        href={getLinkedInShareLink(link)}
        icon={<LinkedInIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.LinkedIn}
        onClick={() => onClickSocial(ShareProvider.LinkedIn)}
        label="LinkedIn"
      />
      <SocialShareButton
        href={getTelegramShareLink(link, description)}
        icon={<TelegramIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Telegram}
        onClick={() => onClickSocial(ShareProvider.Telegram)}
        label="Telegram"
      />
      <SocialShareButton
        href={getEmailShareLink(link, emailTitle ?? description)}
        icon={<MailIcon />}
        variant={ButtonVariant.Primary}
        className="bg-theme-bg-email text-theme-label-primary"
        onClick={() => onClickSocial(ShareProvider.Email)}
        label="Email"
      />
      {'share' in globalThis?.navigator && (
        <SocialShareButton
          icon={<MenuIcon size={IconSize.Large} className="rotate-90" />}
          variant={ButtonVariant.Primary}
          className="bg-theme-bg-email text-theme-label-primary"
          onClick={onNativeShare}
          label="Share via..."
        />
      )}
    </>
  );
}
