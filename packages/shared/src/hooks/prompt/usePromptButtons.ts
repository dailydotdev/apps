import { useMemo } from 'react';
import type { Prompt } from '../../graphql/prompt';

interface UseFeedTags {
  prompts: Prompt[];
  width: number;
  base?: number;
  offset?: number;
  showAll?: boolean;
}

const basePadding = 25;
const char = 8;
const gap = 8;
const iconSize = 24;

export const usePromptButtons = ({
  base = basePadding,
  prompts,
  width,
  offset = 0,
  showAll = false,
}: UseFeedTags): Prompt[] => {
  return useMemo(() => {
    if (showAll) {
      return prompts;
    }

    if (!prompts?.length || width === 0) {
      return [];
    }

    let totalLength = offset;

    return prompts.reduce((items, tag, index) => {
      const baseWidth = base + gap;
      const minWidth = index === 0 ? base : baseWidth;
      const addition = tag.label.length * char + minWidth + iconSize;
      const remaining = prompts.length - (items.length + 1); // the value 1 is for the tag we are about to add here

      totalLength += addition;

      if (remaining === 0) {
        if (totalLength <= width) {
          items.push(tag);
        }

        return items;
      }

      const remainingChars = remaining.toString().length * char + iconSize;
      const remainingWidth = baseWidth + remainingChars;

      if (totalLength + remainingWidth > width) {
        return items;
      }

      items.push(tag);

      return items;
    }, []);
  }, [showAll, prompts, width, offset, base]);
};
