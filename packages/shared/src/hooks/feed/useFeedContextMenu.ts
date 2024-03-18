import React, { useState } from 'react';
import useContextMenu from '../useContextMenu';
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
  postShareMenuIndex: number;
  postMenuLocation: PostMenuLocation;
  postShareMenuLocation: PostMenuLocation;
  setPostMenuIndex: (value: PostMenuLocation | undefined) => void;
  setPostShareMenuIndex: (value: PostMenuLocation | undefined) => void;
};

export default function useFeedContextMenu(): FeedContextMenu {
  const [postMenuLocation, setPostMenuLocation] = useState<PostMenuLocation>();
  const [postShareMenuLocation, setPostShareMenuLocation] =
    useState<PostMenuLocation>();
  const postMenuIndex = postMenuLocation?.index;
  const postShareMenuIndex = postShareMenuLocation?.index;
  const { showReportMenu } = useReportPostMenu(ContextMenu.PostContext);
  const { onMenuClick: showShareMenu } = useContextMenu({
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
    showReportMenu(e);
  };

  const onShareMenuClick = (
    e: React.MouseEvent,
    post: Post,
    index: number,
    row: number,
    column: number,
  ) => {
    if (postMenuIndex === index) {
      setPostShareMenuLocation(null);
      return;
    }
    setPostShareMenuLocation({ index, row, column });
    showShareMenu(e);
  };

  return {
    onMenuClick,
    onShareMenuClick,
    postMenuIndex,
    postShareMenuIndex,
    postMenuLocation,
    postShareMenuLocation,
    setPostMenuIndex: setPostMenuLocation,
    setPostShareMenuIndex: setPostShareMenuLocation,
  };
}
