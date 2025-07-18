import type React from 'react';
import { useState } from 'react';
import type { Post } from '../../graphql/posts';

export type PostLocation = {
  index: number;
  row: number;
  column: number;
  isAd?: boolean;
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
  postMenuLocation: PostLocation;
  setPostMenuIndex: (value: PostLocation | undefined) => void;
};

export default function useFeedContextMenu(): FeedContextMenu {
  const [postMenuLocation, setPostMenuLocation] = useState<PostLocation>();
  const postMenuIndex = postMenuLocation?.index;

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
  };

  const onShareMenuClick = (
    e: React.MouseEvent,
    _post: Post,
    index: number,
    row: number,
    column: number,
  ) => {
    if (postMenuIndex === index) {
      setPostMenuLocation(null);
      return;
    }
    setPostMenuLocation({ index, row, column });
  };

  return {
    onMenuClick,
    onShareMenuClick,
    postMenuIndex,
    postMenuLocation,
    setPostMenuIndex: setPostMenuLocation,
  };
}
