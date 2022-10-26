import React, { ReactElement, useContext } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { Post } from '../graphql/posts';
import ShareIcon from './icons/Share';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import { OnShareOrBookmarkProps } from './post/PostActions';
import BookmarkIcon from './icons/Bookmark';
import { Origin } from '../lib/analytics';
import {
  getFacebookShareLink,
  getLinkedInShareLink,
  getRedditShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../lib/share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import LinkIcon from './icons/Link';
import { ShareVersion } from '../lib/featureValues';
import TwitterIcon from './icons/Twitter';
import WhatsappIcon from './icons/Whatsapp';
import FacebookIcon from './icons/Facebook';
import RedditIcon from './icons/Reddit';
import LinkedInIcon from './icons/LinkedIn';
import TelegramIcon from './icons/Telegram';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  { ssr: false },
);

interface ShareOptionsMenuProps extends OnShareOrBookmarkProps {
  post: Post;
  postCardShareVersion: ShareVersion;
  onHidden?: () => unknown;
  contextId?: string;
}

type ShareOption = {
  href?: string;
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
  };
  const trackAndCopyLink = () => {
    copyLink();
    onClick(ShareProvider.CopyLink);
  };
  const shareOptions: ShareOption[] = [];
  const shareTargets = [
    {
      icon: BookmarkIcon,
      secondary: post?.bookmarked,
      className: 'bg-theme-color-bun',
      label: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
      action: onBookmark,
    },
    {
      icon: LinkIcon,
      className: 'bg-theme-color-pepper',
      label: 'Copy link to article',
      action: trackAndCopyLink,
    },
    {
      href: getTwitterShareLink(link, post?.title),
      icon: TwitterIcon,
      className: 'bg-theme-bg-twitter',
      onClick: () => trackClick(ShareProvider.Twitter),
      label: 'Twitter',
    },
    {
      href: getWhatsappShareLink(link),
      icon: WhatsappIcon,
      onClick: () => trackClick(ShareProvider.WhatsApp),
      className: 'bg-theme-bg-whatsapp',
      label: 'WhatsApp',
    },
    {
      href: getFacebookShareLink(link),
      icon: FacebookIcon,
      className: 'bg-theme-bg-facebook',
      onClick: () => trackClick(ShareProvider.Facebook),
      label: 'Facebook',
    },
    {
      href: getRedditShareLink(link, post?.title),
      icon: RedditIcon,
      className: 'bg-theme-bg-reddit',
      onClick: () => trackClick(ShareProvider.Reddit),
      label: 'Reddit',
    },
    {
      href: getLinkedInShareLink(link),
      icon: LinkedInIcon,
      className: 'bg-theme-bg-linkedin',
      onClick: () => trackClick(ShareProvider.LinkedIn),
      label: 'LinkedIn',
    },
    {
      href: getTelegramShareLink(link, post?.title),
      icon: TelegramIcon,
      className: 'bg-theme-bg-telegram',
      onClick: () => trackClick(ShareProvider.Telegram),
      label: 'Telegram',
    },
  ];
  if (postCardShareVersion === ShareVersion.V2) {
    shareOptions.push(
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
    );
  } else if (postCardShareVersion === ShareVersion.V3) {
    shareOptions.push(
      ...shareTargets.map((social) => ({
        href: social.href,
        icon: (
          <MenuIcon
            secondary={social.secondary}
            className={classNames(
              social.className,
              'text-white p-1 rounded-md',
            )}
            Icon={social.icon}
          />
        ),
        text: social.label,
        action: social.onClick,
      })),
    );
  } else {
    shareOptions.push(
      ...shareTargets.map((social) => ({
        href: social.href,
        icon: <MenuIcon secondary={social.secondary} Icon={social.icon} />,
        text: social.label,
        action: social.onClick,
      })),
    );
  }

  return (
    <PortalMenu
      disableBoundariesCheck
      id={contextId}
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
    >
      {shareOptions.map(({ href, icon, text, action }) => (
        <Item key={text} className="typo-callout" onClick={action}>
          {href ? (
            <a
              className="flex items-center w-full typo-callout"
              data-testid={`social-share-${text}`}
              href={href}
              rel="noopener"
              target="_blank"
            >
              {icon} {text}
            </a>
          ) : (
            <span className="flex items-center w-full typo-callout">
              {icon} {text}
            </span>
          )}
        </Item>
      ))}
    </PortalMenu>
  );
}
