import React, { ReactElement, useContext, useState } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import useFeedSettings from '../hooks/useFeedSettings';
import useReportPost from '../hooks/useReportPost';
import { Post, ReportReason } from '../graphql/posts';
import TrashIcon from '../../icons/trash.svg';
import HammerIcon from '../../icons/hammer.svg';
import EyeIcon from '../../icons/eye.svg';
import ShareIcon from '../../icons/share.svg';
import BlockIcon from '../../icons/block.svg';
import FlagIcon from '../../icons/flag.svg';
import RepostPostModal from './modals/ReportPostModal';
import useTagAndSource from '../hooks/useTagAndSource';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import { useShareOrCopyLink } from '../hooks/useShareOrCopyLink';
import {
  ToastSubject,
  useToastNotification,
} from '../hooks/useToastNotification';
import { PostItem } from '../hooks/useFeed';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type PostOptionsMenuProps = {
  postIndex?: number;
  postItem: PostItem;
  onHidden?: () => unknown;
  onRemovePost?: (postIndex: number) => Promise<unknown>;
  onRevertRemovedPost?: (postItem: PostItem) => Promise<unknown>;
  setShowDeletePost?: () => unknown;
  setShowBanPost?: () => unknown;
};

type ReportPostAsync = (
  postIndex: number,
  post: Post,
  reason: ReportReason,
  comment: string,
  blockSource: boolean,
) => Promise<unknown>;

export default function PostOptionsMenu({
  postIndex,
  postItem,
  onHidden,
  onRemovePost,
  onRevertRemovedPost,
  setShowDeletePost,
  setShowBanPost,
}: PostOptionsMenuProps): ReactElement {
  const { post } = postItem || {};
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
    origin: 'post context menu',
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
      await undo();
      await onRevertRemovedPost?.(postItem);
    };
    displayToast(message, { subject: ToastSubject.Feed, onUndo });
    await onRemovePost?.(_postIndex);
  };

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
        extra: { origin: 'post context menu' },
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
        extra: { origin: 'post context menu' },
      }),
    );

    await showMessageAndRemovePost(
      '🙈 This article won’t show up on your feed anymore',
      postIndex,
      () => unhidePost(post.id),
    );
  };

  const shareLink = post?.commentsPermalink;
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    link: shareLink,
    text: post?.title,
    trackObject: () =>
      postAnalyticsEvent('share post', post, {
        extra: { origin: 'post context menu' },
      }),
  });

  const postOptions: {
    icon: ReactElement;
    text: string;
    action: () => unknown;
  }[] = [
    {
      icon: <MenuIcon Icon={EyeIcon} />,
      text: 'Hide',
      action: onHidePost,
    },
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      text: 'Share article',
      action: () =>
        onShareOrCopyLink({
          subject: postIndex ? ToastSubject.Feed : ToastSubject.PostContent,
        }),
    },
    {
      icon: <MenuIcon Icon={BlockIcon} />,
      text: `Don't show articles from ${post?.source?.name}`,
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
  if (setShowDeletePost) {
    postOptions.push({
      icon: <MenuIcon Icon={TrashIcon} />,
      text: 'Remove',
      action: setShowDeletePost,
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
        id="post-context"
        className="menu-primary"
        animation="fade"
        onHidden={onHidden}
      >
        {postOptions.map(({ icon, text, action }) => (
          <Item key={text} className="typo-callout" onClick={action}>
            <span className="flex w-full typo-callout">
              {icon} {text}
            </span>
          </Item>
        ))}
      </PortalMenu>
      {reportModal && (
        <RepostPostModal
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
