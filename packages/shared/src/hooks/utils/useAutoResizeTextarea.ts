import type { RefObject } from 'react';
import { useLayoutEffect } from 'react';

export const useAutoResizeTextarea = (
  textareaRef: RefObject<HTMLTextAreaElement>,
  value: string,
  maxHeight?: number,
): void => {
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';

    const { scrollHeight } = textarea;
    const nextHeight =
      typeof maxHeight === 'number'
        ? Math.min(scrollHeight, maxHeight)
        : scrollHeight;

    textarea.style.height = `${nextHeight}px`;

    if (typeof maxHeight !== 'number') {
      textarea.style.removeProperty('max-height');
      textarea.style.removeProperty('overflow-y');
      return;
    }

    textarea.style.maxHeight = `${maxHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [maxHeight, textareaRef, value]);
};
