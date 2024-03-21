import React, { ReactElement, useContext } from 'react';
import { Item, useContextMenu } from '@dailydotdev/react-contexify';
import { Post } from '../../../../graphql/posts';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { useCopyPostLink } from '../../../../hooks/useCopyPostLink';
import AnalyticsContext from '../../../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../../../lib/feed';
import { ShareProvider } from '../../../../lib/share';
import { Origin } from '../../../../lib/analytics';
import PortalMenu, { MenuItemProps } from '../../../fields/PortalMenu';
import { MenuIcon } from '../../../MenuIcon';
import { LazyModal } from '../../../modals/common/types';
import { SimpleTooltip } from '../../../tooltips';
import { Button, ButtonSize } from '../../../buttons/Button';
import { getContextBottomPosition } from '../../../utilities';
import useLeanPostActions from '../../../../hooks/post/useLeanPostActions';
import { BookmarkIcon, LinkIcon, ShareIcon } from '../../../icons';

export interface ShareButtonProps {
  post: Post;
}

export default function ShareButton({ post }: ShareButtonProps): ReactElement {
  const id = `share-options-menu-${post?.id}`;
  const { show } = useContextMenu({ id });
  const { openModal } = useLazyModal();
  const link = post && post?.commentsPermalink;
  const [, copyLink] = useCopyPostLink(link);
  const { onBookmark } = useLeanPostActions();
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
      action: () => onBookmark(post),
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
          size={ButtonSize.Small}
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
            <span className="flex w-full items-center typo-callout">
              {icon} {label}
            </span>
          </Item>
        ))}
      </PortalMenu>
    </>
  );
}
