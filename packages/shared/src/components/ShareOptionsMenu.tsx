import React, { ReactElement, useContext } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { Post } from '../graphql/posts';
import ShareIcon from './icons/Share';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import { ShareBookmarkProps } from './post/PostActions';
import BookmarkIcon from './icons/Bookmark';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { ShareProvider } from '../lib/share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import LinkIcon from './icons/Link';
import FeaturesContext from '../contexts/FeaturesContext';
import AuthContext from '../contexts/AuthContext';
import SquadIcon from './icons/Squad';
import { SquadImage } from './squads/SquadImage';
import DefaultSquadIcon from './icons/DefaultSquad';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { verifyPermission } from '../graphql/squads';
import { SourcePermissions } from '../graphql/sources';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  { ssr: false },
);

interface ShareOptionsMenuProps extends ShareBookmarkProps {
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
  const { openModal } = useLazyModal();
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
      text: 'Share post via...',
      action: () => onShare(post),
    },
    {
      icon: (
        <MenuIcon
          secondary={post?.bookmarked}
          Icon={BookmarkIcon}
          className={post?.bookmarked && 'text-theme-color-bun'}
        />
      ),
      text: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
      action: onBookmark,
    },
    {
      icon: <MenuIcon Icon={LinkIcon} />,
      text: 'Copy link to post',
      action: trackAndCopyLink,
    },
  ];

  if (hasSquadAccess && !post?.private) {
    if (!squads?.length) {
      shareOptions.push({
        icon: <MenuIcon Icon={SquadIcon} />,
        text: 'Post to new squad',
        action: () =>
          openModal({
            type: LazyModal.NewSquad,
            props: { origin: Origin.Share },
          }),
      });
    }

    squads?.map(
      (squad) =>
        squad.active &&
        verifyPermission(squad, SourcePermissions.Post) &&
        shareOptions.push({
          icon: squad.image ? (
            <SquadImage className="mr-2.5 w-6 h-6" {...squad} />
          ) : (
            <MenuIcon Icon={DefaultSquadIcon} />
          ),
          text: `Share to ${squad.name}`,
          action: () => {
            trackEvent(
              postAnalyticsEvent(AnalyticsEvent.StartShareToSquad, post),
            );
            openModal({
              type: LazyModal.PostToSquad,
              props: {
                squad,
                post,
                onSharedSuccessfully: () => {
                  trackEvent(
                    postAnalyticsEvent(AnalyticsEvent.ShareToSquad, post),
                  );
                },
              },
            });
          },
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
