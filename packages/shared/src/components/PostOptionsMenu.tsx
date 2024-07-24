import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import useFeedSettings from '../hooks/useFeedSettings';
import useReportPost from '../hooks/useReportPost';
import { Post, UserVote, isVideoPost } from '../graphql/posts';
import {
  TrashIcon,
  HammerIcon,
  EyeIcon,
  BlockIcon,
  FlagIcon,
  PlusIcon,
  EditIcon,
  UpvoteIcon,
  DownvoteIcon,
  SendBackwardIcon,
  BringForwardIcon,
  PinIcon,
  BellSubscribedIcon,
  BellIcon,
  ShareIcon,
  MiniCloseIcon,
  MinusIcon,
  BellAddIcon,
} from './icons';
import { ReportedCallback } from './modals';
import useTagAndSource from '../hooks/useTagAndSource';
import LogContext from '../contexts/LogContext';
import { postLogEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import {
  ToastSubject,
  useConditionalFeature,
  useFeedLayout,
  useSourceActionsNotify,
  useToastNotification,
} from '../hooks';
import { AllFeedPages, generateQueryKey } from '../lib/query';
import AuthContext from '../contexts/AuthContext';
import { LogEvent, Origin } from '../lib/log';
import { usePostMenuActions } from '../hooks/usePostMenuActions';
import { getPostByIdKey } from '../hooks/usePostById';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { labels } from '../lib';
import { MenuItemProps } from './fields/ContextMenu';
import { ActiveFeedContext } from '../contexts';
import { useAdvancedSettings } from '../hooks/feed';
import { ContextMenu as ContextMenuTypes } from '../hooks/constants';
import useContextMenu from '../hooks/useContextMenu';
import { SourceType } from '../graphql/sources';
import { useSharePost } from '../hooks/useSharePost';
import { feature } from '../lib/featureManagement';
import { useBookmarkReminder } from '../hooks/notifications';
import { BookmarkReminderIcon } from './icons/Bookmark/Reminder';
import { useSourceActionsFollow } from '../hooks/source/useSourceActionsFollow';

const ContextMenu = dynamic(
  () => import(/* webpackChunkName: "contextMenu" */ './fields/ContextMenu'),
  {
    ssr: false,
  },
);

export interface PostOptionsMenuProps {
  postIndex?: number;
  post: Post;
  prevPost?: Post;
  nextPost?: Post;
  feedName?: AllFeedPages;
  onHidden?: () => unknown;
  onRemovePost?: (postIndex: number) => Promise<unknown>;
  setShowBanPost?: () => unknown;
  setShowPromotePost?: () => unknown;
  contextId?: string;
  origin: Origin;
  allowPin?: boolean;
}

export default function PostOptionsMenu({
  postIndex,
  post,
  prevPost,
  nextPost,
  feedName,
  onHidden,
  onRemovePost,
  setShowBanPost,
  setShowPromotePost,
  origin,
  allowPin,
  contextId = ContextMenuTypes.PostContext,
}: PostOptionsMenuProps): ReactElement {
  const client = useQueryClient();
  const router = useRouter();
  const { user, isLoggedIn } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const { isOpen: isPostOptionsOpen } = useContextMenu({
    id: contextId,
  });
  const { feedSettings, advancedSettings, checkSettingsEnabledState } =
    useFeedSettings({ enabled: isPostOptionsOpen });
  const { onUpdateSettings } = useAdvancedSettings({ enabled: false });
  const { logEvent } = useContext(LogContext);
  const { hidePost, unhidePost } = useReportPost();
  const { openSharePost } = useSharePost(origin);

  const { openModal } = useLazyModal();
  const { queryKey: feedQueryKey, logOpts } = useContext(ActiveFeedContext);
  const {
    onBlockSource,
    onBlockTags,
    onFollowTags,
    onUnblockSource,
    onUnblockTags,
  } = useTagAndSource({
    origin: Origin.PostContextMenu,
    postId: post?.id,
    shouldInvalidateQueries: false,
  });

  const { value: isNotifyExperiment } = useConditionalFeature({
    feature: feature.sourceNotifyButton,
    shouldEvaluate: isPostOptionsOpen,
  });

  const isSourceBlocked = useMemo(() => {
    return !!feedSettings?.excludeSources?.some(
      (excludedSource) => excludedSource.id === post?.source?.id,
    );
  }, [feedSettings?.excludeSources, post?.source?.id]);

  const shouldShowSubscribe =
    isLoggedIn && !isSourceBlocked && post?.source?.type === SourceType.Machine;

  const sourceSubscribe = useSourceActionsNotify({
    source: shouldShowSubscribe ? post?.source : undefined,
  });

  const showMessageAndRemovePost = async (
    message: string,
    _postIndex: number,
    undo?: () => unknown,
  ) => {
    const onUndo = async () => {
      await undo?.();
      client.invalidateQueries(generateQueryKey(feedName, user));
    };
    displayToast(message, {
      subject: ToastSubject.Feed,
      onUndo: undo !== null ? onUndo : null,
    });
    onRemovePost?.(_postIndex);
  };
  const {
    onConfirmDeletePost,
    onPinPost,
    onSwapPinnedPost,
    onToggleDownvotePost,
  } = usePostMenuActions({
    post,
    postIndex,
    onPinSuccessful: async () => {
      const key = getPostByIdKey(post.id);
      const cached = client.getQueryData(key);
      if (cached) {
        client.setQueryData<Post>(key, (data) => ({
          ...data,
          pinnedAt: post.pinnedAt ? null : new Date(),
        }));
      }

      await client.invalidateQueries(feedQueryKey);
      displayToast(
        post.pinnedAt
          ? 'Your post has been unpinned'
          : '📌 Your post has been pinned',
      );
    },
    onSwapPostSuccessful: async () => {
      await client.invalidateQueries(feedQueryKey);
    },
    onPostDeleted: ({ index, post: deletedPost }) => {
      logEvent(
        postLogEvent(LogEvent.DeletePost, deletedPost, {
          extra: { origin },
          ...logOpts,
        }),
      );
      return showMessageAndRemovePost('The post has been deleted', index, null);
    },
    origin,
  });

  const onReportedPost: ReportedCallback = async (
    reportedPost,
    { index, shouldBlockSource },
  ): Promise<void> => {
    showMessageAndRemovePost(labels.reporting.reportFeedbackText, index);

    if (shouldBlockSource) {
      await onBlockSource({ source: reportedPost?.source });
    }
  };

  const onBlockSourceClick = async (): Promise<void> => {
    const { successful } = await onBlockSource({
      source: post?.source,
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    showMessageAndRemovePost(
      `🚫 ${post?.source?.name} blocked`,
      postIndex,
      () => onUnblockSource({ source: post?.source }),
    );
  };

  const onUnblockSourceClick = async (): Promise<void> => {
    const { successful } = await onUnblockSource({
      source: post?.source,
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    displayToast(`${post?.source?.name} unblocked`, {
      subject: ToastSubject.Feed,
    });
  };

  const onBlockTag = async (tag: string): Promise<void> => {
    const { successful } = await onBlockTags({
      tags: [tag],
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    const isTagFollowed = feedSettings?.includeTags?.indexOf(tag) !== -1;
    const undoAction = isTagFollowed ? onFollowTags : onUnblockTags;
    await showMessageAndRemovePost(`⛔️ #${tag} blocked`, postIndex, () =>
      undoAction({ tags: [tag], requireLogin: true }),
    );
  };
  const video = advancedSettings?.find(({ title }) => title === 'Videos');
  const onToggleVideo = async () => {
    const isEnabled = checkSettingsEnabledState(video?.id);
    const icon = isEnabled ? '⛔️' : '✅';
    const label = isEnabled ? 'blocked' : 'unblocked';
    await onUpdateSettings(video.id, !isEnabled);
    await showMessageAndRemovePost(
      `${icon} Video content ${label}`,
      postIndex,
      () => onUpdateSettings(video.id, isEnabled),
    );
  };

  const onHidePost = async (): Promise<void> => {
    const { successful } = await hidePost(post.id);

    if (!successful) {
      return;
    }

    logEvent(
      postLogEvent('hide post', post, {
        extra: { origin: Origin.PostContextMenu },
        ...logOpts,
      }),
    );

    showMessageAndRemovePost(
      '🙈 This post won’t show up on your feed anymore',
      postIndex,
      () => unhidePost(post.id),
    );
  };

  const postOptions: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      label: 'Share via',
      action: () =>
        openSharePost({
          post,
          ...logOpts,
        }),
    },
    {
      icon: <MenuIcon Icon={EyeIcon} />,
      label: 'Hide',
      action: onHidePost,
    },
  ];

  const { shouldUseListFeedLayout } = useFeedLayout();

  if (!shouldUseListFeedLayout) {
    postOptions.push({
      icon: (
        <MenuIcon
          className={classNames(
            post?.userState?.vote === UserVote.Down &&
              'text-accent-ketchup-default',
          )}
          Icon={DownvoteIcon}
          secondary={post?.userState?.vote === UserVote.Down}
        />
      ),
      label: 'Downvote',
      action: onToggleDownvotePost,
    });
  }

  const isReminderActive = useConditionalFeature({
    feature: feature.bookmarkReminder,
    shouldEvaluate: isPostOptionsOpen,
  });
  const { onRemoveReminder } = useBookmarkReminder({ post });

  if (isReminderActive && isLoggedIn) {
    const hasPostReminder = !!post?.bookmark?.remindAt;

    // Add/Edit reminder
    postOptions.push({
      icon: <MenuIcon Icon={BookmarkReminderIcon} />,
      label: hasPostReminder ? 'Edit reminder' : 'Read it later',
      action: () => {
        openModal({ type: LazyModal.BookmarkReminder, props: { post } });
      },
    });

    if (hasPostReminder) {
      // Remove
      postOptions.push({
        icon: <MenuIcon Icon={MiniCloseIcon} />,
        label: 'Remove reminder',
        action: () => {
          onRemoveReminder(post.id);
        },
      });
    }
  }

  const {
    haveNotificationsOn,
    onNotify: onNotifyToggle,
    isReady: isReadyNotifications,
  } = sourceSubscribe;
  const { isFollowing, toggleFollow } = useSourceActionsFollow({
    source: post?.source,
  });

  if (shouldShowSubscribe) {
    if (!isNotifyExperiment) {
      postOptions.push({
        icon: (
          <MenuIcon
            Icon={haveNotificationsOn ? BellSubscribedIcon : BellIcon}
          />
        ),
        label: `${haveNotificationsOn ? 'Unsubscribe from' : 'Subscribe to'} ${
          post?.source?.name
        }`,
        action: isReadyNotifications ? onNotifyToggle : undefined,
        Wrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
      });
    } else {
      postOptions.push({
        icon: <MenuIcon Icon={isFollowing ? MinusIcon : PlusIcon} />,
        label: `${isFollowing ? 'Unfollow' : 'Follow'} ${post?.source?.name}`,
        action: toggleFollow,
      });

      if (isFollowing) {
        postOptions.push({
          icon: (
            <MenuIcon
              Icon={haveNotificationsOn ? BellSubscribedIcon : BellAddIcon}
            />
          ),
          label: haveNotificationsOn
            ? `Remove notifications from ${post.source.name}`
            : `Notify on new post from ${post.source.name}`,
          action: onNotifyToggle,
        });
      }
    }
  }

  postOptions.push({
    icon: <MenuIcon Icon={BlockIcon} />,
    label: isSourceBlocked
      ? `Show posts from ${post?.source?.name}`
      : `Don't show posts from ${post?.source?.name}`,
    action: isSourceBlocked ? onUnblockSourceClick : onBlockSourceClick,
  });

  if (video && isVideoPost(post)) {
    const isEnabled = checkSettingsEnabledState(video.id);
    const label = isEnabled ? `Don't show` : 'Show';
    postOptions.push({
      icon: <MenuIcon Icon={isEnabled ? BlockIcon : PlusIcon} />,
      label: `${label} video content`,
      action: onToggleVideo,
    });
  }

  post?.tags?.forEach((tag) => {
    if (tag.length) {
      const isBlocked = feedSettings?.blockedTags?.includes(tag);
      postOptions.push({
        icon: <MenuIcon Icon={isBlocked ? PlusIcon : BlockIcon} />,
        label: isBlocked ? `Follow #${tag}` : `Not interested in #${tag}`,
        action: () => onBlockTag(tag),
      });
    }
  });

  postOptions.push({
    icon: <MenuIcon Icon={FlagIcon} />,
    label: 'Report',
    action: async () =>
      openModal({
        type: LazyModal.ReportPost,
        props: {
          index: postIndex,
          post,
          onReported: onReportedPost,
          origin: Origin.PostContextMenu,
        },
      }),
  });
  if (user?.id && post?.author?.id === user?.id) {
    postOptions.push({
      icon: <MenuIcon Icon={EditIcon} />,
      label: 'Edit post',
      action: () => router.push(`${post.commentsPermalink}/edit`),
    });
  }
  if (onConfirmDeletePost) {
    postOptions.push({
      icon: <MenuIcon Icon={TrashIcon} />,
      label: 'Delete post',
      action: onConfirmDeletePost,
    });
  }

  if (allowPin && onSwapPinnedPost) {
    if (nextPost?.pinnedAt) {
      postOptions.unshift({
        icon: <MenuIcon Icon={SendBackwardIcon} secondary={!!post.pinnedAt} />,
        label: 'Send backward',
        action: () => onSwapPinnedPost({ swapWithId: nextPost.id }),
      });
    }

    if (prevPost?.pinnedAt) {
      postOptions.unshift({
        icon: <MenuIcon Icon={BringForwardIcon} secondary={!!post.pinnedAt} />,
        label: 'Bring forward',
        action: () => onSwapPinnedPost({ swapWithId: prevPost.id }),
      });
    }
  }

  if (allowPin && onPinPost) {
    postOptions.unshift({
      icon: <MenuIcon Icon={PinIcon} secondary={!!post.pinnedAt} />,
      label: post.pinnedAt ? 'Unpin from top' : 'Pin to top',
      action: onPinPost,
    });
  }

  if (setShowBanPost) {
    postOptions.push({
      icon: <MenuIcon Icon={HammerIcon} />,
      label: 'Ban',
      action: setShowBanPost,
    });
  }
  if (setShowPromotePost) {
    const promoteFlag = post.flags?.promoteToPublic;
    postOptions.push({
      icon: <MenuIcon Icon={promoteFlag ? DownvoteIcon : UpvoteIcon} />,
      label: promoteFlag ? 'Demote' : 'Promote',
      action: setShowPromotePost,
    });
  }

  return (
    <ContextMenu
      disableBoundariesCheck
      id={contextId}
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
      options={postOptions}
      isOpen={isPostOptionsOpen}
    />
  );
}
