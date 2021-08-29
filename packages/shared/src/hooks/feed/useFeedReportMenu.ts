import React, { useState } from 'react';
import { FeedItem, PostItem } from '../useFeed';
import { trackEvent } from '../../lib/analytics';
import useReportPostMenu from '../useReportPostMenu';

export default function useFeedReportMenu(
  items: FeedItem[],
  removePost: (page: number, index: number) => void,
): {
  onMenuClick: (e: React.MouseEvent, index: number) => void;
  postNotificationIndex: number;
  postMenuIndex: number;
  onReportPost: () => Promise<void>;
  onHidePost: () => Promise<void>;
  setPostMenuIndex: (value: number | undefined) => void;
} {
  const [postMenuIndex, setPostMenuIndex] = useState<number>();
  const [postNotificationIndex, setPostNotificationIndex] = useState<number>();
  const { showReportMenu } = useReportPostMenu();

  const onReportPost = async (): Promise<void> => {
    setPostNotificationIndex(postMenuIndex);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const item = items[postMenuIndex] as PostItem;
    setPostNotificationIndex(null);
    removePost(item.page, item.index);
  };

  const onHidePost = async (): Promise<void> => {
    const item = items[postMenuIndex] as PostItem;
    removePost(item.page, item.index);
  };

  const onMenuClick = (e: React.MouseEvent, index: number) => {
    if (postMenuIndex === index) {
      setPostMenuIndex(null);
      return;
    }
    trackEvent({ category: 'Post', action: 'Menu' });
    setPostMenuIndex(index);
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showReportMenu(e, {
      position: { x: right - 147, y: bottom + 4 },
    });
  };

  return {
    postNotificationIndex,
    onReportPost,
    onHidePost,
    onMenuClick,
    postMenuIndex,
    setPostMenuIndex,
  };
}
