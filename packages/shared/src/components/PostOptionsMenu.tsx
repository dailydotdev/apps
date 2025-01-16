import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import useFeedSettings from '../hooks/useFeedSettings';
import useReportPost from '../hooks/useReportPost';
import type { Post } from '../graphql/posts';
import { isVideoPost, UserVote } from '../graphql/posts';
import {
  AddUserIcon,
  BellAddIcon,
  BellSubscribedIcon,
  BlockIcon,
  BringForwardIcon,
  DownvoteIcon,
  EditIcon,
  EyeIcon,
  FlagIcon,
  FolderIcon,
  HammerIcon,
  MiniCloseIcon,
  MinusIcon,
  PinIcon,
  PlusIcon,
  RemoveUserIcon,
  SendBackwardIcon,
  ShareIcon,
  ShieldIcon,
  ShieldWarningIcon,
  TrashIcon,
  UpvoteIcon,
} from './icons';
import type { ReportedCallback } from './modals';
import useTagAndSource from '../hooks/useTagAndSource';
import LogContext from '../contexts/LogContext';
import { postLogEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import {
  ToastSubject,
  useAdvancedSettings,
  useFeedLayout,
  usePlusSubscription,
  useSourceActionsNotify,
  useToastNotification,
} from '../hooks';
import type { AllFeedPages } from '../lib/query';
import { generateQueryKey } from '../lib/query';
import AuthContext from '../contexts/AuthContext';
import { LogEvent, Origin } from '../lib/log';
import { usePostMenuActions } from '../hooks/usePostMenuActions';
import usePostById, {
  getPostByIdKey,
  invalidatePostCacheById,
} from '../hooks/usePostById';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { labels } from '../lib';
import type { MenuItemProps } from './fields/ContextMenu';
import { ContextMenu as ContextMenuTypes } from '../hooks/constants';
import useContextMenu from '../hooks/useContextMenu';
import { SourceType } from '../graphql/sources';
import { useSharePost } from '../hooks/useSharePost';
import { useBookmarkReminder } from '../hooks/notifications';
import { BookmarkReminderIcon } from './icons/Bookmark/Reminder';
import { useSourceActionsFollow } from '../hooks/source/useSourceActionsFollow';
import { useContentPreference } from '../hooks/contentPreference/useContentPreference';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../graphql/contentPreference';
import { isFollowingContent } from '../hooks/contentPreference/types';
import { useIsSpecialUser } from '../hooks/auth/useIsSpecialUser';
import { useActiveFeedContext } from '../contexts';

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
  setShowClickbaitPost?: () => unknown;
  contextId?: string;
  origin: Origin;
  allowPin?: boolean;
}

export default function PostOptionsMenu({
  postIndex,
  post: initialPost,
  prevPost,
  nextPost,
  feedName,
  onHidden,
  onRemovePost,
  setShowBanPost,
  setShowPromotePost,
  setShowClickbaitPost,
  origin,
  allowPin,
  contextId = ContextMenuTypes.PostContext,
}: PostOptionsMenuProps): ReactElement {
  const client = useQueryClient();
  const router = useRouter();
  const { user, isLoggedIn } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const { isOpen: isPostOptionsOpen, onHide: closePostOptions } =
    useContextMenu({
      id: contextId,
    });
  const { post: loadedPost } = usePostById({
    id: initialPost?.id,
  });
  const feedContextData = useActiveFeedContext();
  const { queryKey: feedQueryKey, logOpts } = feedContextData;
  const isCustomFeed = feedQueryKey?.[0] === 'custom';
  const customFeedId = isCustomFeed ? (feedQueryKey?.[2] as string) : undefined;
  const post = loadedPost ?? initialPost;
  const { showPlusSubscription, isPlus } = usePlusSubscription();
  const { feedSettings, advancedSettings, checkSettingsEnabledState } =
    useFeedSettings({
      enabled: isPostOptionsOpen,
      feedId: customFeedId,
    });
  const { onUpdateSettings } = useAdvancedSettings({
    enabled: false,
    feedId: customFeedId,
  });
  const { logEvent } = useContext(LogContext);
  const { hidePost, unhidePost } = useReportPost();
  const { openSharePost } = useSharePost(origin);
  const { follow, unfollow, unblock } = useContentPreference();
  const { openModal } = useLazyModal();

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
    feedId: customFeedId,
  });
  const isSourceBlocked = useMemo(() => {
    return !!feedSettings?.excludeSources?.some(
      (excludedSource) => excludedSource.id === post?.source?.id,
    );
  }, [feedSettings?.excludeSources, post?.source?.id]);
  const isBlockedAuthor =
    post?.author?.contentPreference?.status === ContentPreferenceStatus.Blocked;

  const shouldShowSubscribe =
    isLoggedIn &&
    !isSourceBlocked &&
    post?.source?.type === SourceType.Machine &&
    !isCustomFeed;

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
      client.invalidateQueries({ queryKey: generateQueryKey(feedName, user) });
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

      await client.invalidateQueries({ queryKey: feedQueryKey });
      displayToast(
        post.pinnedAt
          ? 'Your post has been unpinned'
          : '📌 Your post has been pinned',
      );
    },
    onSwapPostSuccessful: async () => {
      await client.invalidateQueries({ queryKey: feedQueryKey });
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
    await onUpdateSettings([
      {
        id: video.id,
        enabled: !isEnabled,
      },
    ]);
    await showMessageAndRemovePost(
      `${icon} Video content ${label}`,
      postIndex,
      () =>
        onUpdateSettings([
          {
            id: video.id,
            enabled: !isEnabled,
          },
        ]),
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

  const { onRemoveReminder } = useBookmarkReminder({ post });

  if (isLoggedIn) {
    const hasPostReminder = !!post?.bookmark?.remindAt;

    // Add/Edit reminder
    postOptions.push({
      icon: (
        <MenuIcon Icon={BookmarkReminderIcon} secondary={hasPostReminder} />
      ),
      label: hasPostReminder ? 'Edit reminder' : 'Read it later',
      action: () => {
        openModal({
          type: LazyModal.BookmarkReminder,
          props: { post, feedContextData },
        });
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

    if (post?.bookmark && showPlusSubscription) {
      postOptions.push({
        icon: <MenuIcon Icon={FolderIcon} />,
        label: 'Move to...',
        action: () => {
          if (!isPlus) {
            openModal({
              type: LazyModal.BookmarkFolder,
              props: {
                // this modal will never submit because the user is not plus
                onSubmit: () => null,
              },
            });
            return;
          }

          openModal({
            type: LazyModal.MoveBookmark,
            props: {
              postId: post.id,
              listId: post.bookmarkList?.id,
              onMoveBookmark: () => {
                logEvent(
                  postLogEvent(LogEvent.MoveBookmarkToFolder, post, logOpts),
                );
                client.invalidateQueries({ queryKey: feedQueryKey });
              },
            },
          });
        },
      });
    }
  }

  const { haveNotificationsOn, onNotify: onNotifyToggle } = sourceSubscribe;
  const { isFollowing, toggleFollow } = useSourceActionsFollow({
    source: post?.source,
  });

  if (shouldShowSubscribe) {
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

  const shouldShowFollow =
    !useIsSpecialUser({ userId: post?.author?.id }) &&
    post?.author &&
    !isBlockedAuthor &&
    isLoggedIn;

  if (shouldShowFollow) {
    const authorName = post.author.name || `@${post.author.username}`;
    const isFollowingUser = isFollowingContent(post.author?.contentPreference);

    postOptions.push({
      icon: <MenuIcon Icon={isFollowingUser ? RemoveUserIcon : AddUserIcon} />,
      label: `${isFollowingUser ? 'Unfollow' : 'Follow'} ${authorName}`,
      action: () => {
        const opts = {
          extra: {
            origin: Origin.PostContextMenu,
            post_id: post.id,
          },
        };

        if (!isFollowingUser) {
          follow({
            id: post.author.id,
            entity: ContentPreferenceType.User,
            entityName: authorName,
            opts,
          });
        } else {
          unfollow({
            id: post.author.id,
            entity: ContentPreferenceType.User,
            entityName: authorName,
            opts,
          });
        }
      },
    });
  }

  postOptions.push({
    icon: <MenuIcon Icon={BlockIcon} />,
    label: isSourceBlocked
      ? `Unblock ${post?.source?.name}`
      : `Block ${post?.source?.name}`,
    action: isSourceBlocked ? onUnblockSourceClick : onBlockSourceClick,
  });

  if (post?.author && post?.author?.id !== user?.id) {
    postOptions.push({
      icon: <MenuIcon Icon={BlockIcon} />,
      label: isBlockedAuthor
        ? `Unblock ${post.author.name}`
        : `Block ${post.author.name}`,
      action: async () => {
        if (!isBlockedAuthor) {
          openModal({
            type: LazyModal.ReportUser,
            props: {
              offendingUser: post.author,
              defaultBlockUser: true,
              onBlockUser: invalidatePostCacheById.bind(null, [
                client,
                post.id,
              ]),
              ...(isCustomFeed && { feedId: customFeedId }),
            },
          });
          return;
        }

        await unblock({
          id: post.author.id,
          entity: ContentPreferenceType.User,
          entityName: post.author.name,
          feedId: router.query.slugOrId ? `${router.query.slugOrId}` : null,
        });

        invalidatePostCacheById(client, post.id);
      },
    });
  }

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
      if (isBlocked && isCustomFeed) {
        return;
      }
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
      action: () => {
        router.push(`${post.commentsPermalink}/edit`).then(() => {
          closePostOptions();
        });
      },
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

  if (setShowClickbaitPost) {
    const isClickbait = post.clickbaitTitleDetected;
    postOptions.push({
      icon: <MenuIcon Icon={isClickbait ? ShieldIcon : ShieldWarningIcon} />,
      label: isClickbait ? 'Remove clickbait' : 'Mark as clickbait',
      action: setShowClickbaitPost,
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
