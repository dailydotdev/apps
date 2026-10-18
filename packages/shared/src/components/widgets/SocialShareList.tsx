import type { ReactElement } from 'react';
import React from 'react';
import { SocialShareButton } from './SocialShareButton';
import { ShareProvider } from '../../lib/share';
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
import { useOpenShareLink } from '../../hooks/useOpenShareLink';
import { SlackShareButton } from './SlackShareButton';
import type { Post } from '../../graphql/posts';
import type { Origin } from '../../lib/log';

interface SocialShareListProps {
  link: string;
  description: string;
  post?: Post;
  origin?: Origin;
  emailTitle?: string;
  emailSummary?: string;
  isCopying?: boolean;
  onCopy?(): void;
  onNativeShare(): void;
  onClickSocial(provider: ShareProvider): void;
  shortenUrl?: boolean;
}

export function SocialShareList({
  link,
  post,
  origin,
  emailTitle,
  emailSummary,
  description,
  isCopying,
  onCopy,
  onNativeShare,
  onClickSocial,
  shortenUrl = true,
}: SocialShareListProps): ReactElement {
  const openShare = useOpenShareLink();

  const openShareLink = async (provider: ShareProvider) => {
    onClickSocial(provider);

    const isEmailShare = provider === ShareProvider.Email;
    await openShare({
      provider,
      link,
      text: isEmailShare ? emailTitle ?? description : description,
      emailSummary,
      shorten: shortenUrl,
    });
  };

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
      {!!post && <SlackShareButton post={post} origin={origin} />}
      <SocialShareButton
        icon={<TwitterIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Twitter}
        onClick={() => openShareLink(ShareProvider.Twitter)}
        label="X"
      />
      <SocialShareButton
        icon={<WhatsappIcon />}
        onClick={() => openShareLink(ShareProvider.WhatsApp)}
        variant={ButtonVariant.Primary}
        color={ButtonColor.WhatsApp}
        label="WhatsApp"
      />
      <SocialShareButton
        icon={<FacebookIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Facebook}
        onClick={() => openShareLink(ShareProvider.Facebook)}
        label="Facebook"
      />
      <SocialShareButton
        icon={<RedditIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Reddit}
        onClick={() => openShareLink(ShareProvider.Reddit)}
        label="Reddit"
      />
      <SocialShareButton
        icon={<LinkedInIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.LinkedIn}
        onClick={() => openShareLink(ShareProvider.LinkedIn)}
        label="LinkedIn"
      />
      <SocialShareButton
        icon={<TelegramIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Telegram}
        onClick={() => openShareLink(ShareProvider.Telegram)}
        label="Telegram"
      />
      <SocialShareButton
        icon={<MailIcon />}
        variant={ButtonVariant.Primary}
        onClick={() => openShareLink(ShareProvider.Email)}
        label="Email"
      />
      {typeof globalThis?.navigator?.share === 'function' && (
        <SocialShareButton
          icon={<MenuIcon size={IconSize.Large} className="rotate-90" />}
          variant={ButtonVariant.Primary}
          onClick={onNativeShare}
          label="Share via..."
        />
      )}
    </>
  );
}
