import { MutableRefObject, useCallback } from 'react';
import { VirtualItem } from 'react-virtual';
import { FeedItem } from '../useFeed';
import { useVirtualWindow } from '../useVirtualWindow';
import { Spaciness } from '../../graphql/settings';

export const cardHeightPx = 366;
export const listHeightPx = 78;

const getFeedGap = (useList: boolean, spaciness: Spaciness): number => {
  if (useList) {
    if (spaciness === 'cozy') {
      return 20;
    }
    if (spaciness === 'roomy') {
      return 12;
    }
    return 8;
  }
  if (spaciness === 'cozy') {
    return 56;
  }
  if (spaciness === 'roomy') {
    return 48;
  }
  return 32;
};

export default function useVirtualFeedGrid(
  items: FeedItem[],
  useList: boolean,
  numCards: number,
  parentRef: MutableRefObject<HTMLElement>,
  spaciness: Spaciness,
): {
  virtualizer: { virtualItems: VirtualItem[]; totalSize: number };
  feedGapPx: number;
  virtualizedNumCards: number;
} {
  const virtualizedNumCards = useList ? 1 : numCards;
  const feedGapPx = getFeedGap(useList, spaciness);
  const virtualizer = useVirtualWindow({
    size: Math.ceil(items.length / virtualizedNumCards),
    overscan: 1,
    parentRef,
    estimateSize: useCallback(
      () => (useList ? listHeightPx : cardHeightPx) + feedGapPx,
      [],
    ),
  });
  return {
    virtualizer,
    feedGapPx,
    virtualizedNumCards,
  };
}
