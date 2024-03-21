import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Item, useContextMenu } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
} from '../../../buttons/Button';
import { Post, UserPostVote } from '../../../../graphql/posts';
import { TooltipPosition } from '../../../tooltips/BaseTooltipContainer';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import useLeanPostActions from '../../../../hooks/post/useLeanPostActions';
import PortalMenu, { MenuItemProps } from '../../../fields/PortalMenu';
import { ReportedCallback } from '../../../modals';
import { LazyModal } from '../../../modals/common/types';
import { Origin } from '../../../../lib/analytics';
import {
  BlockIcon,
  BookmarkIcon,
  DownvoteIcon,
  EditIcon,
  EyeIcon,
  FlagIcon,
  HammerIcon,
  MenuIcon,
  PinIcon,
  TrashIcon,
  UpvoteIcon,
} from '../../../icons';
import { SimpleTooltip } from '../../../tooltips';
import { MenuIcon as Menu } from '../../../MenuIcon';
import { labels } from '../../../../lib';

type OptionsButtonProps = ButtonProps<AllowedTags> & {
  post: Post;
  tooltipPlacement?: TooltipPosition;
};

const OptionButton = ({
  post,
  className,
  tooltipPlacement = 'left',
  buttonSize = ButtonSize.Small,
  ...props
}: OptionsButtonProps): ReactElement => {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const {
    onBookmark,
    onDownvote,
    onHidePost,
    onPromotePost,
    onBanPost,
    canDeletePost,
    onDeletePost,
    canPinPost,
    onPinPost,
    onBlockSource,
    onBlockTag,
    showMessageAndRemovePost,
  } = useLeanPostActions();

  const id = `post-actions-menu-${post?.id}`;
  const { show } = useContextMenu({
    id,
  });

  const router = useRouter();

  const postOptions: MenuItemProps[] = [
    {
      icon: <Menu Icon={EyeIcon} />,
      label: 'Hide',
      action: () => onHidePost?.(post),
    },
    {
      icon: (
        <Menu
          secondary={post?.bookmarked}
          Icon={BookmarkIcon}
          className={post?.bookmarked && 'text-theme-color-bun'}
        />
      ),
      label: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
      action: () => onBookmark?.(post),
    },
    {
      icon: (
        <Menu
          className={classNames(
            post?.userState?.vote === UserPostVote.Down &&
              'text-theme-color-ketchup',
          )}
          Icon={DownvoteIcon}
          secondary={post?.userState?.vote === UserPostVote.Down}
        />
      ),
      label: 'Downvote',
      action: () => onDownvote?.(post),
    },
    {
      icon: <Menu Icon={BlockIcon} />,
      label: `Don't show posts from ${post?.source?.name}`,
      action: () => onBlockSource?.(post),
    },
  ];

  post?.tags?.forEach((tag) => {
    if (tag.length) {
      postOptions.push({
        icon: <Menu Icon={BlockIcon} />,
        label: `Not interested in #${tag}`,
        action: () => onBlockTag?.(post, tag),
      });
    }
  });

  const onReportedPost: ReportedCallback = async (
    reportedPost,
    { shouldBlockSource },
  ): Promise<void> => {
    showMessageAndRemovePost(
      labels.reporting.reportFeedbackText,
      reportedPost as Post,
    );

    if (shouldBlockSource) {
      await onBlockSource(reportedPost as Post);
    }
  };

  postOptions.push({
    icon: <Menu Icon={FlagIcon} />,
    label: 'Report',
    action: async () =>
      openModal({
        type: LazyModal.ReportPost,
        props: {
          post,
          onReported: onReportedPost,
          origin: Origin.PostContextMenu,
        },
      }),
  });
  if (user?.id && post?.author?.id === user?.id) {
    postOptions.push({
      icon: <Menu Icon={EditIcon} />,
      label: 'Edit post',
      action: () => router.push(`${post.commentsPermalink}/edit`),
    });
  }
  if (canDeletePost(post)) {
    postOptions.push({
      icon: <Menu Icon={TrashIcon} />,
      label: 'Delete post',
      action: () => onDeletePost(post),
    });
  }
  if (canPinPost(post)) {
    postOptions.unshift({
      icon: <Menu Icon={PinIcon} secondary={!!post.pinnedAt} />,
      label: post.pinnedAt ? 'Unpin from top' : 'Pin to top',
      action: () => onPinPost(post),
    });
  }
  if (onBanPost) {
    postOptions.push({
      icon: <Menu Icon={HammerIcon} />,
      label: 'Ban',
      action: () => onBanPost(post),
    });
  }
  if (onPromotePost) {
    const promoteFlag = post.flags?.promoteToPublic;
    postOptions.push({
      icon: <Menu Icon={promoteFlag ? DownvoteIcon : UpvoteIcon} />,
      label: promoteFlag ? 'Demote' : 'Promote',
      action: () => onPromotePost(post),
    });
  }

  return (
    <>
      <SimpleTooltip placement={tooltipPlacement} content="Options">
        <Button
          {...props}
          onClick={(e) => {
            show(e);
          }}
          className={classNames('btn-tertiary my-auto', className)}
          size={buttonSize}
          icon={<MenuIcon />}
        />
      </SimpleTooltip>
      <PortalMenu
        disableBoundariesCheck
        id={id}
        className="menu-primary"
        animation="fade"
      >
        {postOptions.map(({ icon, label, action }) => (
          <Item key={label} className="typo-callout" onClick={action}>
            <span className="flex w-full items-center typo-callout">
              {icon} {label}
            </span>
          </Item>
        ))}
      </PortalMenu>
    </>
  );
};

export default OptionButton;
