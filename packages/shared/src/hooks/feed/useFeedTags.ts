import { useMemo } from 'react';

interface UseFeedTags {
  tags: string[];
  width: number;
}

const base = 25;
const char = 8;
const gap = 8;
const baseWidth = base + gap;

export const useFeedTags = ({ tags, width }: UseFeedTags): string[] => {
  return useMemo(() => {
    if (!tags?.length || width === 0) {
      return [];
    }

    let totalLength = 0;

    return tags.reduce((items, tag, index) => {
      const minWidth = index === 0 ? base : baseWidth;
      const addition = tag.length * char + minWidth;
      const remaining = tags.length - (items.length + 1);

      totalLength += addition;

      if (remaining === 0) {
        if (totalLength <= width) {
          items.push(tag);
        }

        return items;
      }

      const remainingChars = (remaining.toString().length + 1) * char;
      const remainingWidth = baseWidth + remainingChars;

      if (totalLength + remainingWidth > width) {
        return items;
      }

      items.push(tag);

      return items;
    }, []);
  }, [tags, width]);
};
