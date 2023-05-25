import React, { ReactElement, useContext, useState } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { QueryKey, useQueryClient } from 'react-query';
import useFeedSettings from '../hooks/useFeedSettings';
import useReportPost from '../hooks/useReportPost';
import { Post, ReportReason } from '../graphql/posts';
import TrashIcon from './icons/Trash';
import HammerIcon from './icons/Hammer';
import EyeIcon from './icons/Eye';
import BlockIcon from './icons/Block';
import FlagIcon from './icons/Flag';
import ReportPostModal from './modals/ReportPostModal';
import useTagAndSource from '../hooks/useTagAndSource';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import {
  ToastSubject,
  useToastNotification,
} from '../hooks/useToastNotification';
import { generateQueryKey } from '../lib/query';
import AuthContext from '../contexts/AuthContext';
import { ShareBookmarkProps } from './post/PostActions';
import BookmarkIcon from './icons/Bookmark';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { usePostMenuActions } from '../hooks/usePostMenuActions';
import { PinIcon } from './icons';
import { getPostByIdKey } from '../hooks/usePostById';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  {
    ssr: false,
  },
);

interface PostOptions {
  icon: ReactElement;
  text: string;
  action: () => unknown;
}

export interface PostOptionsMenuProps extends ShareBookmarkProps {
  postIndex?: number;
  post: Post;
  feedName?: string;
  onHidden?: () => unknown;
  feedQueryKey?: QueryKey;
  onRemovePost?: (postIndex: number) => Promise<unknown>;
  setShowBanPost?: () => unknown;
  contextId?: string;
  origin: Origin;
  allowPin?: boolean;
}

type ReportPostAsync = (
  postIndex: number,
  post: Post,
  reason: ReportReason,
  comment: string,
  blockSource: boolean,
) => Promise<unknown>;

export default function PostOptionsMenu({
  onBookmark,
  postIndex,
  post,
  feedName,
  onHidden,
  onRemovePost,
  setShowBanPost,
  feedQueryKey,
  origin,
  allowPin,
  contextId = 'post-context',
}: PostOptionsMenuProps): ReactElement {
  const client = useQueryClient();
  const { user } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const { feedSettings } = useFeedSettings();
  const { trackEvent } = useContext(AnalyticsContext);
  const { reportPost, hidePost, unhidePost } = useReportPost();
  const {
    onFollowSource,
    onUnfollowSource,
    onFollowTags,
    onBlockTags,
    onUnblockTags,
  } = useTagAndSource({
    origin: Origin.PostContextMenu,
    postId: post?.id,
  });
  const [reportModal, setReportModal] = useState<{
    index?: number;
    post?: Post;
  }>();

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
  const { onConfirmDeletePost, onPinPost } = usePostMenuActions({
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
    onPostDeleted: ({ index, post: deletedPost }) => {
      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.DeletePost, deletedPost, {
          extra: { origin },
        }),
      );
      return showMessageAndRemovePost('The post has been deleted', index, null);
    },
  });

  const onReportPost: ReportPostAsync = async (
    reportPostIndex,
    reportedPost,
    reason,
    comment,
    blockSource,
  ): Promise<void> => {
    const { successful } = await reportPost({
      id: reportedPost?.id,
      reason,
      comment,
    });

    if (!successful) {
      return;
    }

    trackEvent(
      postAnalyticsEvent('report post', reportedPost, {
        extra: { origin: Origin.PostContextMenu },
      }),
    );

    showMessageAndRemovePost('🚨 Thanks for reporting!', reportPostIndex);

    if (blockSource) {
      await onUnfollowSource({ source: reportedPost?.source });
    }
  };

  const onBlockSource = async (): Promise<void> => {
    const { successful } = await onUnfollowSource({
      source: post?.source,
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    showMessageAndRemovePost(
      `🚫 ${post?.source?.name} blocked`,
      postIndex,
      () => onFollowSource({ source: post?.source }),
    );
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

  const onHidePost = async (): Promise<void> => {
    const { successful } = await hidePost(post.id);

    if (!successful) {
      return;
    }

    trackEvent(
      postAnalyticsEvent('hide post', post, {
        extra: { origin: Origin.PostContextMenu },
      }),
    );

    showMessageAndRemovePost(
      '🙈 This post won’t show up on your feed anymore',
      postIndex,
      () => unhidePost(post.id),
    );
  };

  const postOptions: PostOptions[] = [
    {
      icon: <MenuIcon Icon={EyeIcon} />,
      text: 'Hide',
      action: onHidePost,
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
      icon: <MenuIcon Icon={BlockIcon} />,
      text: `Don't show posts from ${post?.source?.name}`,
      action: onBlockSource,
    },
  ];

  post?.tags?.forEach((tag) => {
    if (tag.length) {
      postOptions.push({
        icon: <MenuIcon Icon={BlockIcon} />,
        text: `Not interested in #${tag}`,
        action: () => onBlockTag(tag),
      });
    }
  });

  postOptions.push({
    icon: <MenuIcon Icon={FlagIcon} />,
    text: 'Report',
    action: async () => setReportModal({ index: postIndex, post }),
  });
  if (onConfirmDeletePost) {
    postOptions.push({
      icon: <MenuIcon Icon={TrashIcon} />,
      text: 'Delete post',
      action: onConfirmDeletePost,
    });
  }
  if (allowPin && onPinPost) {
    postOptions.unshift({
      icon: <MenuIcon Icon={PinIcon} secondary={!!post.pinnedAt} />,
      text: post.pinnedAt ? 'Unpin from top' : 'Pin to top',
      action: onPinPost,
    });
  }
  if (setShowBanPost) {
    postOptions.push({
      icon: <MenuIcon Icon={HammerIcon} />,
      text: 'Ban',
      action: setShowBanPost,
    });
  }
  return (
    <>
      <PortalMenu
        disableBoundariesCheck
        id={contextId}
        className="menu-primary"
        animation="fade"
        onHidden={onHidden}
      >
        {postOptions.map(({ icon, text, action }) => (
          <Item key={text} className="typo-callout" onClick={action}>
            <span className="flex items-center w-full typo-callout">
              {icon} {text}
            </span>
          </Item>
        ))}
      </PortalMenu>
      {reportModal && (
        <ReportPostModal
          isOpen={!!reportModal}
          postIndex={reportModal.index}
          post={reportModal.post}
          onReport={onReportPost}
          onRequestClose={() => setReportModal(null)}
        />
      )}
    </>
  );
}
