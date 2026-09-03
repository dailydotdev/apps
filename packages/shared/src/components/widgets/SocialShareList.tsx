import type { ReactElement } from 'react';
import React from 'react';
import { SocialShareButton } from './SocialShareButton';
import { getShareLink, ShareProvider } from '../../lib/share';
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
import { ButtonColor, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useGetShortUrl } from '../../hooks';

interface SocialShareListProps {
  link: string;
  description: string;
  emailTitle?: string;
  emailSummary?: string;
  isCopying?: boolean;
  onCopy?(): void;
  onNativeShare(): void;
  onClickSocial(provider: ShareProvider): void;
  shortenUrl?: boolean;
  /** Passed to every tile; Large keeps the existing look. */
  size?: ButtonSize;
}

export function SocialShareList({
  link,
  emailTitle,
  emailSummary,
  description,
  isCopying,
  onCopy,
  onNativeShare,
  onClickSocial,
  shortenUrl = true,
  size = ButtonSize.Large,
}: SocialShareListProps): ReactElement {
  const { getShortUrl } = useGetShortUrl();

  const openShareLink = async (provider: ShareProvider) => {
    onClickSocial(provider);

    const isEmailShare = provider === ShareProvider.Email;
    const shortLink = shortenUrl ? await getShortUrl(link) : link;
    const shareLink = getShareLink({
      provider,
      link: shortLink,
      text: isEmailShare ? emailTitle ?? description : description,
      emailSummary,
    });
    window.open(shareLink, '_blank');
  };

  return (
    <>
      {onCopy && (
        <SocialShareButton
          size={size}
          onClick={onCopy}
          icon={<CopyIcon secondary={isCopying} />}
          variant={ButtonVariant.Primary}
          label={isCopying ? 'Copied!' : 'Copy link'}
        />
      )}
      <SocialShareButton
        size={size}
        icon={<TwitterIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Twitter}
        onClick={() => openShareLink(ShareProvider.Twitter)}
        label="X"
      />
      <SocialShareButton
        size={size}
        icon={<WhatsappIcon />}
        onClick={() => openShareLink(ShareProvider.WhatsApp)}
        variant={ButtonVariant.Primary}
        color={ButtonColor.WhatsApp}
        label="WhatsApp"
      />
      <SocialShareButton
        size={size}
        icon={<FacebookIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Facebook}
        onClick={() => openShareLink(ShareProvider.Facebook)}
        label="Facebook"
      />
      <SocialShareButton
        size={size}
        icon={<RedditIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Reddit}
        onClick={() => openShareLink(ShareProvider.Reddit)}
        label="Reddit"
      />
      <SocialShareButton
        size={size}
        icon={<LinkedInIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.LinkedIn}
        onClick={() => openShareLink(ShareProvider.LinkedIn)}
        label="LinkedIn"
      />
      <SocialShareButton
        size={size}
        icon={<TelegramIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Telegram}
        onClick={() => openShareLink(ShareProvider.Telegram)}
        label="Telegram"
      />
      <SocialShareButton
        size={size}
        icon={<MailIcon />}
        variant={ButtonVariant.Primary}
        onClick={() => openShareLink(ShareProvider.Email)}
        label="Email"
      />
      {typeof globalThis?.navigator?.share === 'function' && (
        <SocialShareButton
          size={size}
          icon={<MenuIcon size={IconSize.Large} className="rotate-90" />}
          variant={ButtonVariant.Primary}
          onClick={onNativeShare}
          label="Share via..."
        />
      )}
    </>
  );
}
