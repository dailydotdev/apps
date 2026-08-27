import type { RefObject } from 'react';
import { useCallback, useLayoutEffect } from 'react';

export const useAutoResizeTextarea = (
  textareaRef: RefObject<HTMLTextAreaElement>,
  value: string,
): void => {
  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [textareaRef]);

  useLayoutEffect(() => {
    resize();
  }, [resize, value]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return undefined;
    }

    let width = textarea.clientWidth;
    const observer = new ResizeObserver(() => {
      if (textarea.clientWidth === width) {
        return;
      }
      width = textarea.clientWidth;
      resize();
    });
    observer.observe(textarea);

    return () => observer.disconnect();
  }, [resize, textareaRef]);
};
