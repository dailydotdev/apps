import React, { useCallback, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
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
  LanguageIcon,
  MenuIcon as RawMenuIcon,
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
  TrendingIcon,
  SettingsIcon,
  AnalyticsIcon,
} from '../../components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  ToastSubject,
  useAdvancedSettings,
  useFeedLayout,
  usePlusSubscription,
  useSourceActionsNotify,
  useToastNotification,
  invalidatePostCacheById,
  usePostById,
} from '../../hooks';
import { useActiveFeedContext } from '../../contexts';
import useFeedSettings from '../../hooks/useFeedSettings';
import { useLogContext } from '../../contexts/LogContext';
import { usePostLogEvent } from '../../lib/feed';
import { useFeedCardContext } from './FeedCardContext';
import useReportPost from '../../hooks/useReportPost';
import { useSharePost } from '../../hooks/useSharePost';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { useLazyModal } from '../../hooks/useLazyModal';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import useTagAndSource from '../../hooks/useTagAndSource';
import { LogEvent, Origin, TargetId } from '../../lib/log';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { isSourceUserSource, SourceType } from '../../graphql/sources';
import { generateQueryKey, getPostByIdKey, RequestKey } from '../../lib/query';
import { usePostMenuActions } from '../../hooks/usePostMenuActions';
import type { Post } from '../../graphql/posts';
import {
  banPost,
  clickbaitPost,
  demotePost,
  isVideoPost,
  PostType,
  promotePost,
  useCanBoostPost,
  UserVote,
} from '../../graphql/posts';
import type { ReportedCallback } from '../../components/modals';
import { labels } from '../../lib';
import { useBookmarkReminder } from '../../hooks/notifications';
import { BookmarkReminderIcon } from '../../components/icons/Bookmark/Reminder';
import { LazyModal } from '../../components/modals/common/types';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { FeedSettingsMenu } from '../../components/feeds/FeedSettings/types';
import { SharedFeedPage } from '../../components/utilities';
import { useSourceActionsFollow } from '../../hooks/source/useSourceActionsFollow';
import { useIsSpecialUser } from '../../hooks/auth/useIsSpecialUser';
import { isFollowingContent } from '../../hooks/contentPreference/types';
import { MenuIcon } from '../../components/MenuIcon';
import { Roles } from '../../lib/user';
import type { PromptOptions } from '../../hooks/usePrompt';
import { usePrompt } from '../../hooks/usePrompt';
import { BoostIcon } from '../../components/icons/Boost';
import type { FeedItem } from '../../hooks/useFeed';
import { isBoostedPostAd } from '../../hooks/useFeed';
import type { MenuItemProps } from '../../components/dropdown/common';

const getBlockLabel = (
  name: string,
  { isCustomFeed, isBlocked }: Record<'isCustomFeed' | 'isBlocked', boolean>,
) => {
  const blockLabel = {
    global: {
      block: `Block ${name}`,
      unblock: `Unblock ${name}`,
    },
    feed: {
      block: `Remove ${name} from this feed`,
      unblock: `Add ${name} to this feed`,
    },
  };

  return blockLabel[isCustomFeed ? 'feed' : 'global'][
    isBlocked ? 'unblock' : 'block'
  ];
};

const PostOptionButtonContent = ({
  post: initialPost,
  origin: initialOrigin,
}): ReactElement => {
  const client = useQueryClient();
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { post: loadedPost } = usePostById({
    id: initialPost?.id,
  });
  const feedContextData = useActiveFeedContext();
  const {
    queryKey: feedQueryKey,
    logOpts,
    allowPin,
    items,
    origin: feedOrigin,
    onRemovePost,
  } = feedContextData;
  const origin = initialOrigin || feedOrigin;

  const { postIndex, prevPost, nextPost } = useMemo(() => {
    const postIndexSelect = items.findIndex(
      (item) =>
        (item.type === 'post' && item.post.id === initialPost.id) ||
        (item.type === 'ad' && item.ad.data?.post?.id === initialPost.id),
    );

    const getPostFromItem = (item: FeedItem) => {
      if (item?.type === 'post') {
        return item.post;
      }
      if (isBoostedPostAd(item)) {
        return item.ad.data.post;
      }
      return null;
    };

    return {
      postIndex: postIndexSelect,
      prevPost: getPostFromItem(items[postIndexSelect - 1]),
      nextPost: getPostFromItem(items[postIndexSelect + 1]),
    };
  }, [items, initialPost.id]);

  const isModerator = user?.roles?.includes(Roles.Moderator);
  const isCustomFeed = feedQueryKey?.[0] === 'custom';
  const customFeedId = isCustomFeed ? (feedQueryKey?.[2] as string) : undefined;
  const post = loadedPost ?? (initialPost as Post);
  const isBriefPost = post?.type === PostType.Brief;
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { feedSettings, advancedSettings, checkSettingsEnabledState } =
    useFeedSettings({
      enabled: true,
      feedId: customFeedId,
    });
  const { onUpdateSettings } = useAdvancedSettings({
    enabled: false,
    feedId: customFeedId,
  });
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const { boostedBy } = useFeedCardContext();
  const { hidePost, unhidePost } = useReportPost();
  const { openSharePost } = useSharePost(origin);
  const { follow, unfollow, unblock, block } = useContentPreference();
  const { openModal } = useLazyModal();
  const { showPrompt } = usePrompt();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const { canBoost } = useCanBoostPost(post);

  const banPostPrompt = useCallback(async () => {
    const options: PromptOptions = {
      title: 'Ban post 💩',
      description: 'Are you sure you want to ban this post?',
      okButton: {
        title: 'Ban',
        className: 'btn-primary-ketchup',
      },
    };
    if (await showPrompt(options)) {
      await banPost(post.id);
    }
  }, [post.id, showPrompt]);

  const promotePostPrompt = useCallback(async () => {
    const promoteFlag = post.flags?.promoteToPublic;

    const options: PromptOptions = {
      title: promoteFlag ? 'Demote post' : 'Promote post',
      description: `Do you want to ${
        promoteFlag ? 'demote' : 'promote'
      } this post ${promoteFlag ? 'from' : 'to'} the public?`,
      okButton: {
        title: promoteFlag ? 'Demote' : 'Promote',
      },
    };
    if (await showPrompt(options)) {
      if (promoteFlag) {
        await demotePost(post.id);
      } else {
        await promotePost(post.id);
      }
    }
  }, [post.flags?.promoteToPublic, post.id, showPrompt]);

  const clickbaitPostPrompt = useCallback(async () => {
    const isClickbait = post.clickbaitTitleDetected;

    const options: PromptOptions = {
      title: isClickbait ? 'Remove clickbait' : 'Mark as clickbait',
      description: `Do you want to ${
        isClickbait ? 'remove' : 'mark'
      } this post as clickbait?`,
      okButton: {
        title: isClickbait ? 'Remove' : 'Mark',
      },
    };

    if (await showPrompt(options)) {
      await clickbaitPost(post.id);
    }
  }, [post.clickbaitTitleDetected, post.id, showPrompt]);

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
    !isCustomFeed &&
    !isBriefPost;

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
      client.invalidateQueries({ queryKey: feedQueryKey });
    };
    displayToast(message, {
      subject: ToastSubject.Feed,
      onUndo: undo !== null ? onUndo : null,
    });
    onRemovePost?.(postIndex);
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
      postLogEvent(LogEvent.HidePost, post, {
        extra: { origin: Origin.PostContextMenu },
        ...logOpts,
      }),
    );

    showMessageAndRemovePost(
      "🙈 This post won't show up on your feed anymore",
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
    canBoost && {
      icon: <MenuIcon Icon={AnalyticsIcon} />,
      label: 'Post analytics',
      anchorProps: {
        href: `${webappUrl}posts/${post.slug}/analytics`,
      },
    },
    !isBriefPost && {
      icon: <MenuIcon Icon={EyeIcon} />,
      label: 'Hide',
      action: onHidePost,
    },
    isBriefPost && {
      icon: <MenuIcon Icon={SettingsIcon} />,
      label: 'Settings',
      action: () => {
        router?.push(`${settingsUrl}/notifications`);
      },
    },
  ].filter(Boolean);

  const onBoostPost = () => {
    openModal({
      type: LazyModal.BoostPost,
      props: {
        post,
      },
    });
  };

  const onManageBoost = async () => {
    openModal({
      type: LazyModal.FetchBoostedPostView,
      props: { campaignId: post.flags.campaignId },
    });
  };

  if (canBoost) {
    const isBoosted = !!post?.flags?.campaignId;
    postOptions.push({
      icon: (
        <MenuIcon
          Icon={isBoosted ? TrendingIcon : BoostIcon}
          secondary={isBoosted}
        />
      ),
      label: isBoosted ? 'Manage ad' : 'Boost post',
      action: isBoosted ? onManageBoost : onBoostPost,
    });
  }

  const { shouldUseListFeedLayout } = useFeedLayout();

  if (!isBriefPost && !shouldUseListFeedLayout) {
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

  if (isLoggedIn && !isBriefPost) {
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

    postOptions.push({
      icon: <MenuIcon Icon={LanguageIcon} />,
      label: 'Translate',
      action: () => {
        if (isPlus) {
          logEvent(postLogEvent(LogEvent.TranslatePost, post, logOpts));
        } else {
          logSubscriptionEvent({
            event_name: LogEvent.UpgradeSubscription,
            target_id: TargetId.ContextMenu,
          });
        }

        if (isCustomDefaultFeed && router.pathname === '/') {
          return router.push(
            `${webappUrl}feeds/${defaultFeedId}/edit?dview=${FeedSettingsMenu.AI}`,
          );
        }

        if (feedQueryKey.some((qk) => qk === SharedFeedPage.Custom)) {
          return router.push(
            `${webappUrl}feeds/${router.query.slugOrId}/edit?dview=${FeedSettingsMenu.AI}`,
          );
        }

        return router.push(`${settingsUrl}/feed/ai`);
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

    if (post?.bookmark) {
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

  if (!isBriefPost && post?.source?.name && !isSourceUserSource(post?.source)) {
    postOptions.push({
      icon: <MenuIcon Icon={BlockIcon} />,
      label: getBlockLabel(post.source.name, {
        isCustomFeed,
        isBlocked: isSourceBlocked,
      }),
      action: isSourceBlocked ? onUnblockSourceClick : onBlockSourceClick,
    });
  }

  if (post?.author && post?.author?.id !== user?.id) {
    postOptions.push({
      icon: <MenuIcon Icon={BlockIcon} />,
      label: getBlockLabel(post.author.name, {
        isCustomFeed,
        isBlocked: isBlockedAuthor,
      }),
      action: async () => {
        const params = {
          id: post.author.id,
          entity: ContentPreferenceType.User,
          entityName: post.author.name,
          feedId: router.query.slugOrId ? `${router.query.slugOrId}` : null,
        };

        if (isBlockedAuthor) {
          await unblock(params);
        } else {
          await block({
            ...params,
            opts: {
              hideToast: true,
            },
          });

          await showMessageAndRemovePost(
            `🚫 ${post.author.name} has been ${
              isCustomFeed ? 'removed' : 'blocked'
            }`,
            postIndex,
            () => unblock(params),
          );
        }

        client.invalidateQueries({
          queryKey: generateQueryKey(
            RequestKey.ContentPreference,
            user,
            RequestKey.UserBlocked,
            {
              feedId: customFeedId || user?.id,
              entity: ContentPreferenceType.User,
            },
          ),
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

  if (!isBriefPost) {
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
            isAd: !!boostedBy,
          },
        }),
    });

    if (user?.id && post?.author?.id === user?.id) {
      postOptions.push({
        icon: <MenuIcon Icon={EditIcon} />,
        label: 'Edit post',
        action: () => {
          router.push(`${post.commentsPermalink}/edit`);
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
          icon: (
            <MenuIcon Icon={SendBackwardIcon} secondary={!!post.pinnedAt} />
          ),
          label: 'Send backward',
          action: () => onSwapPinnedPost({ swapWithId: nextPost.id }),
        });
      }

      if (prevPost?.pinnedAt) {
        postOptions.unshift({
          icon: (
            <MenuIcon Icon={BringForwardIcon} secondary={!!post.pinnedAt} />
          ),
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

    if (isModerator) {
      postOptions.push({
        icon: <MenuIcon Icon={HammerIcon} />,
        label: 'Ban',
        action: banPostPrompt,
      });
    }
    if (isModerator) {
      const promoteFlag = post.flags?.promoteToPublic;
      postOptions.push({
        icon: <MenuIcon Icon={promoteFlag ? DownvoteIcon : UpvoteIcon} />,
        label: promoteFlag ? 'Demote' : 'Promote',
        action: promotePostPrompt,
      });
    }

    if (isModerator) {
      const isClickbait = post.clickbaitTitleDetected;
      postOptions.push({
        icon: <MenuIcon Icon={isClickbait ? ShieldIcon : ShieldWarningIcon} />,
        label: isClickbait ? 'Remove clickbait' : 'Mark as clickbait',
        action: clickbaitPostPrompt,
      });
    }
  }

  return (
    <DropdownMenuContent>
      <DropdownMenuOptions options={postOptions} />
    </DropdownMenuContent>
  );
};

export const PostOptionButton = (props): ReactElement => {
  const {
    size = ButtonSize.Small,
    triggerClassName,
    variant = ButtonVariant.Tertiary,
  } = props;
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
        <Button
          variant={variant}
          icon={<RawMenuIcon />}
          size={size}
          className={classNames('my-auto', triggerClassName)}
        />
      </DropdownMenuTrigger>
      {!!open && <PostOptionButtonContent {...props} />}
    </DropdownMenu>
  );
};
