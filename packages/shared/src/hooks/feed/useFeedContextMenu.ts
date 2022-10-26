import { useContextMenu } from '@dailydotdev/react-contexify';
import React, { useState } from 'react';
import { Post } from '../../graphql/posts';
import { ContextMenu } from '../constants';
import useReportPostMenu from '../useReportPostMenu';

type PostMenuLocation = {
  index: number;
  row: number;
  column: number;
};

type FeedContextMenu = {
  onMenuClick: (
    e: React.MouseEvent,
    index: number,
    row: number,
    column: number,
  ) => void;
  onShareMenuClick: (
    e: React.MouseEvent,
    post: Post,
    index: number,
    row: number,
    column: number,
  ) => void;
  postMenuIndex: number;
  postMenuLocation: PostMenuLocation;
  setPostMenuIndex: (value: PostMenuLocation | undefined) => void;
};

export default function useFeedContextMenu(): FeedContextMenu {
  const [postMenuLocation, setPostMenuLocation] = useState<PostMenuLocation>();
  const postMenuIndex = postMenuLocation?.index;
  const { showReportMenu } = useReportPostMenu();
  const { show: showShareMenu } = useContextMenu({
    id: ContextMenu.ShareContext,
  });

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
      position: { x: right, y: bottom + 4 },
    });
  };

  const onShareMenuClick = (
    e: React.MouseEvent,
    post: Post,
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
    showShareMenu(e, {
      position: { x: right, y: bottom + 4 },
    });
  };

  return {
    onMenuClick,
    onShareMenuClick,
    postMenuIndex,
    postMenuLocation,
    setPostMenuIndex: setPostMenuLocation,
  };
}
