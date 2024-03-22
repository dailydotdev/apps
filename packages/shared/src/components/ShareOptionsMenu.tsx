import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { Post } from '../graphql/posts';
import { ShareIcon, BookmarkIcon, LinkIcon } from './icons';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import { ShareBookmarkProps } from './post/PostActions';
import { Origin } from '../lib/analytics';
import { ShareProvider } from '../lib/share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { useFeature } from './GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { useFeedLayout, useGetShortUrl } from '../hooks';
import { ReferralCampaignKey } from '../lib/referral';
import { ContextMenu as ContextMenuIds } from '../hooks/constants';
import useContextMenu from '../hooks/useContextMenu';

const ContextMenu = dynamic(
  () => import(/* webpackChunkName: "contextMenu" */ './fields/ContextMenu'),
  { ssr: false },
);

interface ShareOptionsMenuProps extends ShareBookmarkProps {
  post: Post;
  onHidden?: () => unknown;
  onBookmark?: () => unknown;
  contextId?: string;
}

type ShareOption = {
  href?: string;
  icon: ReactElement;
  label: string;
  action: () => unknown;
};

export default function ShareOptionsMenu({
  onShare,
  onBookmark,
  post,
  onHidden,
  contextId = ContextMenuIds.ShareContext,
}: ShareOptionsMenuProps): ReactElement {
  const link = post?.commentsPermalink;
  const [, copyLink] = useCopyPostLink(link);
  const { trackEvent } = useContext(AnalyticsContext);
  const { getShortUrl } = useGetShortUrl();
  const { isOpen: isShareOptionsOpen } = useContextMenu({
    id: contextId,
  });

  const onClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  const trackAndCopyLink = async () => {
    const shortLink = await getShortUrl(link, ReferralCampaignKey.SharePost);
    copyLink({ link: shortLink });
    onClick(ShareProvider.CopyLink);
  };

  const bookmarkOnCard = useFeature(feature.bookmarkOnCard);
  const { shouldUseMobileFeedLayout } = useFeedLayout();

  const shareOptions: ShareOption[] = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      label: 'Share post via...',
      action: () => onShare(post),
    },
  ];

  if (!bookmarkOnCard && !shouldUseMobileFeedLayout) {
    shareOptions.push({
      icon: (
        <MenuIcon
          secondary={post?.bookmarked}
          Icon={BookmarkIcon}
          className={post?.bookmarked && 'text-theme-color-bun'}
        />
      ),
      label: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
      action: onBookmark,
    });
  }

  shareOptions.push({
    icon: <MenuIcon Icon={LinkIcon} />,
    label: 'Copy link to post',
    action: trackAndCopyLink,
  });

  return (
    <ContextMenu
      disableBoundariesCheck
      id={contextId}
      className={classNames(
        'menu-primary',
        shouldUseMobileFeedLayout && 'left-0',
      )}
      animation="fade"
      onHidden={onHidden}
      isOpen={isShareOptionsOpen}
      options={shareOptions}
    />
  );
}
