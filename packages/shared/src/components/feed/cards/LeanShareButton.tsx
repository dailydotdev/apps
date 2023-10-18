import React, { ReactElement, useContext } from 'react';
import { Item, useContextMenu } from '@dailydotdev/react-contexify';
import { Post } from '../../../graphql/posts';
import { Button, ButtonSize } from '../../buttons/Button';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import ShareIcon from '../../icons/Share';
import PortalMenu, { MenuItemProps } from '../../fields/PortalMenu';
import { getContextBottomPosition } from '../../utilities';
import { MenuIcon } from '../../MenuIcon';
import BookmarkIcon from '../../icons/Bookmark';
import LinkIcon from '../../icons/Link';
import { useCopyPostLink } from '../../../hooks/useCopyPostLink';
import AnalyticsContext from '../../../contexts/AnalyticsContext';
import { ShareProvider } from '../../../lib/share';
import { postAnalyticsEvent } from '../../../lib/feed';
import { Origin } from '../../../lib/analytics';
import { LazyModal } from '../../modals/common/types';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useActiveFeedContext } from '../../../contexts';

export interface LeanShareButtonProps {
  post: Post;
}

export default function LeanShareButton({
  post,
}: LeanShareButtonProps): ReactElement {
  const id = `share-options-menu-${post?.id}`;
  const { show } = useContextMenu({ id });
  const { openModal } = useLazyModal();
  const link = post && post?.commentsPermalink;
  const [, copyLink] = useCopyPostLink(link);
  const { onBookmark } = useActiveFeedContext();
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

  const shareOptions: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      label: 'Share post via...',
      action: async () =>
        openModal({
          type: LazyModal.SharePost,
          props: {
            post,
            origin: Origin.ShareBar,
          },
        }),
    },
    {
      icon: (
        <MenuIcon
          secondary={post?.bookmarked}
          Icon={BookmarkIcon}
          className={post?.bookmarked && 'text-theme-color-bun'}
        />
      ),
      label: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
      action: () => onBookmark?.(post),
    },
    {
      icon: <MenuIcon Icon={LinkIcon} />,
      label: 'Copy link to post',
      action: trackAndCopyLink,
    },
  ];

  return (
    <>
      <SimpleTooltip content="Share post">
        <Button
          icon={<ShareIcon />}
          buttonSize={ButtonSize.Small}
          onClick={(e) => show(e, { position: getContextBottomPosition(e) })}
          className="btn-tertiary-cabbage"
        />
      </SimpleTooltip>
      <PortalMenu
        disableBoundariesCheck
        id={id}
        className="menu-primary"
        animation="fade"
      >
        {shareOptions.map(({ icon, label, action }) => (
          <Item key={label} className="typo-callout" onClick={action}>
            <span className="flex items-center w-full typo-callout">
              {icon} {label}
            </span>
          </Item>
        ))}
      </PortalMenu>
    </>
  );
}
