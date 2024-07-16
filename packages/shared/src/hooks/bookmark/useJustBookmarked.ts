import { useEffect, useRef } from 'react';
import { isNullOrUndefined } from '../../lib/func';
import { UseBookmarkProviderProps } from './common';

interface UseJustBookmarked {
  justBookmarked: boolean;
  wasBookmarked: boolean;
}

export const useJustBookmarked = ({
  bookmarked,
}: UseBookmarkProviderProps): UseJustBookmarked => {
  const wasBookmarkedRef = useRef<boolean>(bookmarked);
  const justBookmarked =
    bookmarked !== wasBookmarkedRef.current && !!bookmarked;

  useEffect(() => {
    // on initial render, we only have few props (server side call) which does not include bookmark information. that would lead to inaccurate value of wasBookmarked
    const isInitialRender =
      isNullOrUndefined(wasBookmarkedRef.current) &&
      !isNullOrUndefined(bookmarked);

    // if bookmarked was just turned off, we can then again consider to have been just bookmarked when the user bookmarks again
    const turnedOffBookmark = wasBookmarkedRef.current && !bookmarked;

    if (isInitialRender || turnedOffBookmark) {
      wasBookmarkedRef.current = bookmarked;
    }
  }, [bookmarked]);

  return { justBookmarked, wasBookmarked: wasBookmarkedRef.current };
};
