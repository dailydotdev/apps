import React, { useState } from 'react';
import useReportPostMenu from '../useReportPostMenu';

export default function useFeedContextMenu(): {
  onMenuClick: (
    e: React.MouseEvent,
    index: number,
    row: number,
    column: number,
  ) => void;
  postMenuIndex: number;
  postMenuLocation: {
    index: number;
    row: number;
    column: number;
  };
  setPostMenuIndex: (
    value: { index: number; row: number; column: number } | undefined,
  ) => void;
} {
  const [postMenuLocation, setPostMenuLocation] = useState<{
    index: number;
    row: number;
    column: number;
  }>();
  const postMenuIndex = postMenuLocation?.index;
  const { showReportMenu } = useReportPostMenu();

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

  return {
    onMenuClick,
    postMenuIndex,
    postMenuLocation,
    setPostMenuIndex: setPostMenuLocation,
  };
}
