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
import FeaturesContext from '../contexts/FeaturesContext';
import AuthContext from '../contexts/AuthContext';
import SquadIcon from './icons/Squad';
import { SquadImage } from './squads/SquadImage';
import DefaultSquadIcon from './icons/DefaultSquad';
import { useModal } from '../hooks/useModal';
import { LazyModals } from './modals/common/types';

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
  const { squads } = useContext(AuthContext);
  const { hasSquadAccess } = useContext(FeaturesContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { openModal } = useModal();
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

  if (hasSquadAccess) {
    // if (!squads.length) {
    shareOptions.push({
      icon: <MenuIcon Icon={SquadIcon} />,
      text: 'Post to your squad',
      action: () =>
        openModal({
          type: LazyModals.SquadsBeta,
        }),
    });
    // }

    squads.map((squad) =>
      shareOptions.push({
        icon: squad.image ? (
          <SquadImage className="mr-2.5 w-5 h-5 text-2xl" {...squad} />
        ) : (
          <MenuIcon Icon={DefaultSquadIcon} />
        ),
        text: squad.name,
        action: () =>
          openModal({
            type: LazyModals.NewSquad,
            ...{
              onPreviousState: () => alert('blabla'),
            },
          }),
      }),
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
