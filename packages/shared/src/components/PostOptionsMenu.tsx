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
import { useToastNotification } from '../hooks/useToastNotification';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type PostOptionsMenuProps = {
  postIndex?: number;
  post: Post;
  onHidden?: () => unknown;
  onRemovePost?: (postIndex: number) => Promise<unknown>;
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
  post,
  onHidden,
  onRemovePost,
  setShowDeletePost,
  setShowBanPost,
}: PostOptionsMenuProps): ReactElement {
  const { displayToast } = useToastNotification();
  const { setAvoidRefresh } = useFeedSettings();
  const { trackEvent } = useContext(AnalyticsContext);
  const { reportPost, hidePost } = useReportPost();
  const { onUnfollowSource, onBlockTags } = useTagAndSource({
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
  ) => {
    displayToast(message);
    onRemovePost?.(_postIndex);
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

    displayToast('🚨 Thanks for reporting!');

    if (blockSource) {
      await onUnfollowSource({ source: reportedPost?.source });
    }
  };

  const onBlockSource = async (): Promise<void> => {
    setAvoidRefresh(true);
    const { successful } = await onUnfollowSource({
      source: post?.source,
      requireLogin: true,
    });
    if (!successful) {
      setAvoidRefresh(false);
      return;
    }
    showMessageAndRemovePost(`🚫 ${post?.source?.name} blocked`, postIndex);
    setAvoidRefresh(false);
  };

  const onBlockTag = async (tag: string): Promise<void> => {
    setAvoidRefresh(true);
    const { successful } = await onBlockTags({
      tags: [tag],
      requireLogin: true,
    });

    if (!successful) {
      setAvoidRefresh(false);
      return;
    }

    await showMessageAndRemovePost(`⛔️ #${tag} blocked`, postIndex);
    setAvoidRefresh(false);
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

    await onRemovePost?.(postIndex);

    if (!postIndex) {
      displayToast('🙈 This article won’t show up on your feed anymore');
    }
  };

  const shareLink = post?.commentsPermalink;
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    displayToast('✅ Copied link to clipboard');
  };

  const onShareOrCopyLink = useShareOrCopyLink({
    link: shareLink,
    text: post?.title,
    copyLink,
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
      action: onShareOrCopyLink,
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
