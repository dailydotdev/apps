import React, { useContext, useState } from 'react';
import { FeedItem, PostItem } from '../useFeed';
import useReportPostMenu from '../useReportPostMenu';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { ReportReason } from '../../graphql/posts';

export default function useFeedReportMenu(
  items: FeedItem[],
  removePost: (page: number, index: number) => void,
  columns: number,
): {
  onMenuClick: (
    e: React.MouseEvent,
    index: number,
    row: number,
    column: number,
  ) => void;
  postNotificationIndex: number;
  postMenuIndex: number;
  onReportPost: (reason: ReportReason) => Promise<void>;
  onHidePost: () => Promise<void>;
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

  const onReportPost = async (reason: ReportReason): Promise<void> => {
    console.log('do something crazy');
    setPostNotificationIndex(postMenuIndex);
    // const item = items[postMenuIndex] as PostItem;
    // trackEvent(
    //   postAnalyticsEvent('report post', item.post, {
    //     columns,
    //     column: postMenuLocation.column,
    //     row: postMenuLocation.row,
    //     extra: { origin: 'feed', reason },
    //   }),
    // );
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // setPostNotificationIndex(null);
    // removePost(item.page, item.index);
  };

  const onHidePost = async (): Promise<void> => {
    const item = items[postMenuIndex] as PostItem;
    trackEvent(
      postAnalyticsEvent('hide post', item.post, {
        columns,
        column: postMenuLocation.column,
        row: postMenuLocation.row,
        extra: { origin: 'feed' },
      }),
    );
    removePost(item.page, item.index);
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
    onMenuClick,
    postMenuIndex,
    setPostMenuIndex: setPostMenuLocation,
  };
}
