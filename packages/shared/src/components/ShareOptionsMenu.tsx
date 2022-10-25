import React, { ReactElement, useContext, useState } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { Post } from '../graphql/posts';
import ShareIcon from './icons/Share';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import { OnShareOrBookmarkProps } from './post/PostActions';
import BookmarkIcon from './icons/Bookmark';
import { Origin } from '../lib/analytics';
import { getFacebookShareLink, getLinkedInShareLink, getRedditShareLink, getTelegramShareLink, getTwitterShareLink, getWhatsappShareLink, ShareProvider } from '../lib/share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import LinkIcon from './icons/Link';
import { ShareVersion } from '../lib/featureValues';
import TwitterIcon from './icons/Twitter';
import WhatsappIcon from './icons/Whatsapp';
import FacebookIcon from './icons/Facebook';
import RedditIcon from './icons/Reddit';
import LinkedInIcon from './icons/LinkedIn';
import TelegramIcon from './icons/Telegram';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

interface ShareOptionsMenuProps extends OnShareOrBookmarkProps {
  post: Post;
  postCardShareVersion: ShareVersion;
  onHidden?: () => unknown;
  contextId?: string;
}

type ShareOption = {
  icon: ReactElement;
  text: string;
  action: () => unknown;
};

export default function ShareOptionsMenu({
  onShare,
  onBookmark,
  post,
  postCardShareVersion,
  onHidden,
  contextId = 'share-context',
}: ShareOptionsMenuProps): ReactElement {
  const link = post && post?.permalink;
  const [, copyLink] = useCopyPostLink(link);
  const { trackEvent } = useContext(AnalyticsContext);

  const onClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );
  const trackClick = (type) => {
    onClick(type);
  }
  const trackAndCopyLink = () => {
    copyLink();
    onClick(ShareProvider.CopyLink);
  };
  const ShareOptions: ShareOption[] = [];
  const socials = [
    {
      href: getTwitterShareLink(link, post?.title),
      icon: <TwitterIcon />,
      className: "bg-theme-bg-twitter",
      onClick: () => trackClick(ShareProvider.Twitter),
      label: "Twitter"
    },
    {
      href: getWhatsappShareLink(link),
      icon: <WhatsappIcon />,
      onClick: () => trackClick(ShareProvider.WhatsApp),
      className: "bg-theme-bg-whatsapp",
      label: "WhatsApp"
    },
    {
      href: getFacebookShareLink(link),
      icon: <FacebookIcon />,
      className: "bg-theme-bg-facebook",
      onClick: () => trackClick(ShareProvider.Facebook),
      label: "Facebook"
    },
    {
      href: getRedditShareLink(link, post?.title),
      icon: <RedditIcon />,
      className: "bg-theme-bg-reddit",
      onClick: () => trackClick(ShareProvider.Reddit),
      label: "Reddit"
    },
    {
      href: getLinkedInShareLink(link),
      icon: <LinkedInIcon />,
      className: "bg-theme-bg-linkedin",
      onClick: () => trackClick(ShareProvider.LinkedIn),
      label: "LinkedIn"
    },
    {
      href: getTelegramShareLink(link, post?.title),
      icon: <TelegramIcon />,
      className: "bg-theme-bg-telegram",
      onClick: () => trackClick(ShareProvider.Telegram),
      label: "Telegram"
    },
  ]
  if (postCardShareVersion === ShareVersion.V2)
  {
    ShareOptions.push(...[
      {
        icon: <MenuIcon Icon={ShareIcon} />,
        text: 'Share article via...',
        action: onShare,
      },
      {
        icon: <MenuIcon secondary={post?.bookmarked} Icon={BookmarkIcon} />,
        text: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
        action: onBookmark,
      },
      {
        icon: <MenuIcon Icon={LinkIcon} />,
        text: 'Copy link to article',
        action: trackAndCopyLink,
      },
    ]);
  }
  if (postCardShareVersion === ShareVersion.V3) {
    ShareOptions.push(...[
      {
        icon: <MenuIcon secondary={post?.bookmarked} Icon={BookmarkIcon} />,
        text: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
        action: onBookmark,
      },
      {
        icon: <MenuIcon Icon={LinkIcon} />,
        text: 'Copy link to article',
        action: trackAndCopyLink,
      }]);
      ShareOptions.push(...socials.map(social => ({
        icon: social.icon,
        text: social.label,
        action: social.onClick
      })))
  }
  if (postCardShareVersion === ShareVersion.V4) {
    ShareOptions.push(...[]);
  }

  return (
    <>
      <PortalMenu
        disableBoundariesCheck
        id={contextId}
        className="menu-primary"
        animation="fade"
        onHidden={onHidden}
      >
        {ShareOptions.map(({ icon, text, action }) => (
          <Item key={text} className="typo-callout" onClick={action}>
            <span className="flex items-center w-full typo-callout">
              {icon} {text}
            </span>
          </Item>
        ))}
      </PortalMenu>
    </>
  );
}
