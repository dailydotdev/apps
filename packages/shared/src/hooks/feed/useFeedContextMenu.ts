import React, { useContext, useState } from 'react';
import { FeedItem, PostItem } from '../useFeed';
import useReportPostMenu from '../useReportPostMenu';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { ReportReason } from '../../graphql/posts';
import useReportPost from '../useReportPost';

export default function useFeedContextMenu(
  items: FeedItem[],
  removePost: (page: number, index: number) => void,
  columns: number,
  setNotification: any,
): {
  onMenuClick: (
    e: React.MouseEvent,
    index: number,
    row: number,
    column: number,
  ) => void;
  postNotificationIndex: number;
  postMenuIndex: number;
  onReportPost: (postIndex: number, reason: ReportReason) => Promise<void>;
  onHidePost: () => Promise<void>;
  onBlockSource: () => Promise<void>;
  onSharePost: () => Promise<void>;
  onBlockTag: (tag: string) => Promise<void>;
  setPostMenuIndex: (
    value: { index: number; row: number; column: number } | undefined,
  ) => void;
} {
  const { trackEvent } = useContext(AnalyticsContext);
  const [postMenuLocation, setPostMenuLocation] =
    useState<{ index: number; row: number; column: number }>();
  const postMenuIndex = postMenuLocation?.index;
  const [postNotificationIndex, setPostNotificationIndex] = useState<number>();
  const { showReportMenu } = useReportPostMenu();
  const { reportPost, hidePost } = useReportPost();

  const onReportPost = async (
    postIndex: number,
    reason: ReportReason,
  ): Promise<void> => {
    const item = items[postIndex] as PostItem;

    setNotification('🚨 Thanks for reporting!');
    setPostNotificationIndex(postIndex);

    reportPost({
      id: item?.post?.id,
      reason,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPostNotificationIndex(null);

    const promise = hidePost(item?.post?.id);
    await Promise.all([promise]).then(() => {
      removePost(item.page, item.index);
    });
  };

  const onBlockTag = async (tag: string): Promise<void> => {
    setPostNotificationIndex(postMenuIndex);
    setNotification(`⛔️ ${tag} blocked`);

    // Block tag need the hook from DD-156

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPostNotificationIndex(null);
  };

  const onBlockSource = async (): Promise<void> => {
    const item = items[postMenuIndex] as PostItem;
    setPostNotificationIndex(postMenuIndex);
    setNotification(`🚫 ${item?.post?.source?.name} blocked`);

    // Block source need the hook from DD-156

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPostNotificationIndex(null);
  };

  const onSharePost = async (): Promise<void> => {
    const item = items[postMenuIndex] as PostItem;
    await navigator.clipboard.writeText(item?.post?.permalink);

    setPostNotificationIndex(postMenuIndex);
    setNotification(`✅ Copied to clipboard`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPostNotificationIndex(null);
  };

  const onHidePost = async (): Promise<void> => {
    const item = items[postMenuIndex] as PostItem;

    const promise = hidePost(item?.post?.id);
    await Promise.all([promise]).then(() => {
      trackEvent(
        postAnalyticsEvent('hide post', item.post, {
          columns,
          column: postMenuLocation.column,
          row: postMenuLocation.row,
          extra: { origin: 'feed' },
        }),
      );
      removePost(item.page, item.index);
    });
  };

  const onMenuClick = (
    e: React.MouseEvent,
    index: number,
    row: number,
    column: number,
  ) => {
    if (postMenuIndex === index) {
      setPostMenuLocation(null);
      return;
    }
    setPostMenuLocation({ index, row, column });
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showReportMenu(e, {
      position: { x: right - 147, y: bottom + 4 },
    });
  };

  return {
    postNotificationIndex,
    onReportPost,
    onHidePost,
    onBlockSource,
    onBlockTag,
    onSharePost,
    onMenuClick,
    postMenuIndex,
    setPostMenuIndex: setPostMenuLocation,
  };
}
