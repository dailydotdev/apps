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
import { ButtonColor, ButtonVariant } from '../buttons/Button';
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
  // When set and the device can share files (mobile), the social buttons open
  // the native share sheet with this image attached instead of the platform's
  // web intent — the only client-side way to share a real image (web intents
  // carry text + link only). Email/Copy keep their dedicated behavior.
  nativeShareFile?: File | null;
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
  nativeShareFile,
}: SocialShareListProps): ReactElement {
  const { getShortUrl } = useGetShortUrl();

  const openShareLink = async (provider: ShareProvider) => {
    onClickSocial(provider);

    const isEmailShare = provider === ShareProvider.Email;
    // On mobile, route the platform buttons through the native share sheet so
    // the image rides along (web intents can't attach files). Called with no
    // prior await to stay inside the tap gesture. Email keeps its mailto.
    if (
      !isEmailShare &&
      nativeShareFile &&
      globalThis.navigator?.canShare?.({ files: [nativeShareFile] })
    ) {
      navigator
        .share({ text: `${description} ${link}`, files: [nativeShareFile] })
        .catch(() => undefined);
      return;
    }

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
          onClick={onCopy}
          icon={<CopyIcon secondary={isCopying} />}
          variant={ButtonVariant.Primary}
          label={isCopying ? 'Copied!' : 'Copy link'}
        />
      )}
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
