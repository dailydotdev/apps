import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { Post } from '../graphql/posts';
import { ShareIcon, LinkIcon } from './icons';
import LogContext from '../contexts/LogContext';
import { postLogEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import { Origin } from '../lib/log';
import { ShareProvider } from '../lib/share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { useGetShortUrl } from '../hooks';
import { ReferralCampaignKey } from '../lib';
import { ContextMenu as ContextMenuIds } from '../hooks/constants';
import useContextMenu from '../hooks/useContextMenu';

const ContextMenu = dynamic(
  () => import(/* webpackChunkName: "contextMenu" */ './fields/ContextMenu'),
  { ssr: false },
);

interface ShareOptionsMenuProps {
  post: Post;
  onHidden?: () => unknown;
  contextId?: string;
  onShare?: (post?: Post) => void;
  shouldUseListFeedLayout: boolean;
}

type ShareOption = {
  href?: string;
  icon: ReactElement;
  label: string;
  action: () => unknown;
};

export default function ShareOptionsMenu({
  shouldUseListFeedLayout,
  onShare,
  post,
  onHidden,
  contextId = ContextMenuIds.ShareContext,
}: ShareOptionsMenuProps): ReactElement {
  const link = post?.commentsPermalink;
  const [, copyLink] = useCopyPostLink(link);
  const { logEvent } = useContext(LogContext);
  const { getShortUrl } = useGetShortUrl();
  const { isOpen: isShareOptionsOpen } = useContextMenu({
    id: contextId,
  });

  const onClick = (provider: ShareProvider) =>
    logEvent(
      postLogEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  const logAndCopyLink = async () => {
    const shortLink = await getShortUrl(link, ReferralCampaignKey.SharePost);
    copyLink({ link: shortLink });
    onClick(ShareProvider.CopyLink);
  };

  const shareOptions: ShareOption[] = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      label: 'Share post via...',
      action: () => onShare(post),
    },
  ];

  shareOptions.push({
    icon: <MenuIcon Icon={LinkIcon} />,
    label: 'Copy link to post',
    action: logAndCopyLink,
  });

  return (
    <ContextMenu
      disableBoundariesCheck
      id={contextId}
      className={classNames(
        'menu-primary',
        shouldUseListFeedLayout && 'left-0',
      )}
      animation="fade"
      onHidden={onHidden}
      isOpen={isShareOptionsOpen}
      options={shareOptions}
    />
  );
}
