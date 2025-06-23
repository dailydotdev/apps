import { useMemo } from 'react';

interface UseFeedTags {
  tags: string[];
  width: number;
  baseTagWidth?: number;
  offset?: number;
}

const DEFAULT_TAG_BASE_WIDTH = 25;
const APPROX_CHAR_WIDTH = 8;
const TAG_HORIZONTAL_GAP = 8;

export const useFeedTags = ({
  baseTagWidth = DEFAULT_TAG_BASE_WIDTH,
  tags,
  width,
  offset = 0,
}: UseFeedTags): string[] => {
  return useMemo(() => {
    if (!tags?.length || width === 0) {
      return [];
    }

    let currentTotalWidth = offset;

    return tags.reduce((visibleTags: string[], tag, index) => {
      const tagWidthIncludingGap = baseTagWidth + TAG_HORIZONTAL_GAP;
      const effectiveTagBaseWidth =
        index === 0 ? baseTagWidth : tagWidthIncludingGap;
      const currentTagCalculatedWidth =
        tag.length * APPROX_CHAR_WIDTH + effectiveTagBaseWidth;
      const remainingTagsCount = tags.length - (visibleTags.length + 1); // the value 1 is for the tag we are about to add here

      currentTotalWidth += currentTagCalculatedWidth;

      if (remainingTagsCount === 0) {
        if (currentTotalWidth <= width) {
          visibleTags.push(tag);
        }

        return visibleTags;
      }

      const remainingChars =
        remainingTagsCount.toString().length * APPROX_CHAR_WIDTH;
      const remainingWidth = tagWidthIncludingGap + remainingChars;

      if (currentTotalWidth + remainingWidth > width) {
        return visibleTags;
      }

      visibleTags.push(tag);

      return visibleTags;
    }, []);
  }, [baseTagWidth, tags, width, offset]);
};
