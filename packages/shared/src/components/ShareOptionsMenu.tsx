import React, { ReactElement, useContext } from 'react';
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
import { ShareProvider } from '../lib/share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import LinkIcon from './icons/Link';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  { ssr: false },
);

interface ShareOptionsMenuProps extends OnShareOrBookmarkProps {
  post: Post;
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
  onHidden,
  contextId = 'share-context',
}: ShareOptionsMenuProps): ReactElement {
  const link = post && post?.commentsPermalink;
  const [, copyLink] = useCopyPostLink(link);
  const { trackEvent } = useContext(AnalyticsContext);

  const onClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  const trackAndCopyLink = () => {
    copyLink();
    onClick(ShareProvider.CopyLink);
  };
  const shareOptions: ShareOption[] = [
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
  ];

  return (
    <PortalMenu
      disableBoundariesCheck
      id={contextId}
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
    >
      {shareOptions.map(({ href, icon, text, action }) => (
        <Item key={text} className="py-1 w-64 typo-callout" onClick={action}>
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
