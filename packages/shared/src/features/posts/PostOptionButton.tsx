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
  LinkIcon,
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
import { canViewPostAnalytics, Roles } from '../../lib/user';
import type { PromptOptions } from '../../hooks/usePrompt';
import { usePrompt } from '../../hooks/usePrompt';
import { BoostIcon } from '../../components/icons/Boost';
import type { FeedItem } from '../../hooks/useFeed';
import { isBoostedPostAd } from '../../hooks/useFeed';
import type { MenuItemProps } from '../../components/dropdown/common';
import { useFeedContentTypeAction } from '../../components/filters/useFeedContentTypeAction';
import { useLoggedCopyPostLink } from '../../hooks/post/useLoggedCopyPostLink';
import { ShareProvider } from '../../lib/share';

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
}: Pick<PostOptionButtonProps, 'post' | 'origin'>): ReactElement => {
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
  const origin = initialOrigin || feedOrigin || Origin.Feed;

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
  const { source } = post;
  if (!source) {
    throw new Error('PostOptionButton requires post.source');
  }
  const activeFeedQueryKey = feedQueryKey ?? [];
  const isBriefPost = post?.type === PostType.Brief;
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { feedSettings } = useFeedSettings({
    enabled: true,
    feedId: customFeedId,
  });
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const { boostedBy } = useFeedCardContext();
  const { hidePost, unhidePost } = useReportPost();
  const { openSharePost } = useSharePost(origin);
  const { onCopyLink, isLoading: isCopyingLink } = useLoggedCopyPostLink(
    post,
    Origin.PostContextMenu,
  );
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
    _postIndex?: number | null,
    undo?: () => unknown,
  ) => {
    const onUndo = async () => {
      await undo?.();
      client.invalidateQueries({ queryKey: activeFeedQueryKey });
    };
    displayToast(message, {
      subject: ToastSubject.Feed,
      ...(undo && {
        action: {
          copy: 'Undo',
          onClick: onUndo,
        },
      }),
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
        client.setQueryData<Post>(key, (data) =>
          data
            ? {
                ...data,
                pinnedAt: post.pinnedAt ? undefined : new Date(),
              }
            : data,
        );
      }

      await client.invalidateQueries({ queryKey: activeFeedQueryKey });
      displayToast(
        post.pinnedAt
          ? 'Your post has been unpinned'
          : '📌 Your post has been pinned',
      );
    },
    onSwapPostSuccessful: async () => {
      await client.invalidateQueries({ queryKey: activeFeedQueryKey });
    },
    onPostDeleted: ({ index, post: deletedPost }) => {
      logEvent(
        postLogEvent(LogEvent.DeletePost, deletedPost, {
          extra: { origin },
          ...logOpts,
        }),
      );
      return showMessageAndRemovePost('The post has been deleted', index);
    },
    origin,
  });

  const onReportedPost: ReportedCallback = async (
    reportedPost,
    { index, shouldBlockSource },
  ): Promise<void> => {
    showMessageAndRemovePost(labels.reporting.reportFeedbackText, index);

    if (shouldBlockSource) {
      if (!reportedPost?.source) {
        throw new Error('Reported post source is required');
      }
      await onBlockSource({ source: reportedPost.source });
    }
  };

  const onBlockSourceClick = async (): Promise<void> => {
    const { successful } = await onBlockSource({
      source,
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    showMessageAndRemovePost(`🚫 ${source.name} blocked`, postIndex, () =>
      onUnblockSource({ source }),
    );
  };

  const onUnblockSourceClick = async (): Promise<void> => {
    const { successful } = await onUnblockSource({
      source,
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    displayToast(`${source.name} unblocked`, {
      subject: ToastSubject.Feed,
    });
  };

  const onToggleTagBlock = async (
    tag: string,
    isBlocked: boolean,
  ): Promise<void> => {
    if (isBlocked) {
      const { successful } = await onUnblockTags({
        tags: [tag],
        requireLogin: true,
      });

      if (!successful) {
        return;
      }

      displayToast(`#${tag} unblocked`, {
        subject: ToastSubject.Feed,
      });
      return;
    }

    const { successful } = await onBlockTags({
      tags: [tag],
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    const isTagFollowed = feedSettings?.includeTags?.includes(tag) ?? false;
    await showMessageAndRemovePost(
      `⛔️ #${tag} blocked`,
      postIndex,
      async () => {
        await onUnblockTags({ tags: [tag], requireLogin: true });
        if (isTagFollowed) {
          await onFollowTags({ tags: [tag], requireLogin: true });
        }
      },
    );
  };

  const contentTypeItem = useFeedContentTypeAction({
    post,
    customFeedId,
    onActionSuccess: (copy, onUndo) =>
      showMessageAndRemovePost(copy, postIndex, onUndo),
  });

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
    {
      icon: <MenuIcon Icon={LinkIcon} />,
      label: 'Copy link',
      action: () => onCopyLink(ShareProvider.CopyLink),
      disabled: isCopyingLink,
    },
  ];

  if (canViewPostAnalytics({ user, post })) {
    postOptions.push({
      icon: <MenuIcon Icon={AnalyticsIcon} />,
      label: 'Post analytics',
      anchorProps: {
        href: `${webappUrl}posts/${post.id}/analytics`,
      },
    });
  }

  if (!isBriefPost) {
    postOptions.push({
      icon: <MenuIcon Icon={EyeIcon} />,
      label: 'Hide',
      action: onHidePost,
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
  }

  if (isBriefPost) {
    postOptions.push({
      icon: <MenuIcon Icon={SettingsIcon} />,
      label: 'Settings',
      action: () => {
        router?.push(`${settingsUrl}/notifications`);
      },
    });
  }

  const onBoostPost = () => {
    openModal({
      type: LazyModal.BoostPost,
      props: {
        post,
      },
    });
  };

  const onManageBoost = async () => {
    const campaignId = post.flags?.campaignId;
    if (!campaignId) {
      throw new Error('Boosted post campaign id is required');
    }

    openModal({
      type: LazyModal.FetchBoostedPostView,
      props: { campaignId },
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

        if (activeFeedQueryKey.some((qk) => qk === SharedFeedPage.Custom)) {
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
                client.invalidateQueries({ queryKey: activeFeedQueryKey });
              },
            },
          });
        },
      });
    }
  }

  const { haveNotificationsOn, onNotify: onNotifyToggle } = sourceSubscribe;
  const { isFollowing, toggleFollow } = useSourceActionsFollow({
    source,
  });
  const author = post?.author;
  const authorName =
    author?.name || (author?.username ? `@${author.username}` : null);

  if (shouldShowSubscribe) {
    postOptions.push({
      icon: <MenuIcon Icon={isFollowing ? MinusIcon : PlusIcon} />,
      label: `${isFollowing ? 'Unfollow' : 'Follow'} ${source.name}`,
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
          ? `Remove notifications from ${source.name}`
          : `Notify on new post from ${source.name}`,
        action: onNotifyToggle,
      });
    }
  }

  const shouldShowFollow =
    !useIsSpecialUser({ userId: author?.id ?? '' }) &&
    !!author &&
    !isBlockedAuthor &&
    isLoggedIn;

  if (shouldShowFollow && authorName) {
    const isFollowingUser = isFollowingContent(author?.contentPreference);

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
            id: author.id,
            entity: ContentPreferenceType.User,
            entityName: authorName,
            opts,
          });
        } else {
          unfollow({
            id: author.id,
            entity: ContentPreferenceType.User,
            entityName: authorName,
            opts,
          });
        }
      },
    });
  }

  if (!isBriefPost && source.name && !isSourceUserSource(source)) {
    postOptions.push({
      icon: <MenuIcon Icon={BlockIcon} />,
      label: getBlockLabel(source.name, {
        isCustomFeed,
        isBlocked: isSourceBlocked,
      }),
      action: isSourceBlocked ? onUnblockSourceClick : onBlockSourceClick,
    });
  }

  if (author && authorName && author.id !== user?.id) {
    postOptions.push({
      icon: <MenuIcon Icon={BlockIcon} />,
      label: getBlockLabel(authorName, {
        isCustomFeed,
        isBlocked: isBlockedAuthor,
      }),
      action: async () => {
        const params = {
          id: author.id,
          entity: ContentPreferenceType.User,
          entityName: authorName,
          ...(router.query.slugOrId
            ? { feedId: `${router.query.slugOrId}` }
            : {}),
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
            `🚫 ${authorName} has been ${isCustomFeed ? 'removed' : 'blocked'}`,
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

  if (contentTypeItem) {
    postOptions.push(contentTypeItem);
  }

  if (!isBriefPost) {
    post?.tags?.forEach((tag) => {
      if (tag.length) {
        const isBlocked = feedSettings?.blockedTags?.includes(tag) ?? false;
        if (isBlocked && isCustomFeed) {
          return;
        }
        postOptions.push({
          icon: <MenuIcon Icon={isBlocked ? PlusIcon : BlockIcon} />,
          label: isBlocked ? `Unblock #${tag}` : `Block #${tag}`,
          action: () => onToggleTagBlock(tag, isBlocked),
        });
      }
    });

    if (
      post.type !== PostType.Poll &&
      user?.id &&
      post?.author?.id === user?.id
    ) {
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

interface PostOptionButtonProps {
  post: Post;
  origin?: Origin;
  size?: ButtonSize;
  variant?: ButtonVariant;
  triggerClassName?: string;
}

export const PostOptionButton = (
  props: PostOptionButtonProps,
): ReactElement => {
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
