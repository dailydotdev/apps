import { Ref, useEffect, useRef, useState } from 'react';

export type UseDynamicHeaderRet<T extends HTMLElement> = {
  ref: Ref<T>;
  progress: number | undefined;
};

export const useDynamicHeader = <T extends HTMLElement>(
  enabled: boolean,
): UseDynamicHeaderRet<T> => {
  const ref = useRef<T>();
  const [progress, setProgress] = useState<number | undefined>();
  const onScroll = useRef<() => void>();

  useEffect(() => {
    onScroll.current = () => {
      const trigger = ref.current;
      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const offset = -rect.y;
      let newProgress: number | undefined;
      if (offset >= 0) {
        newProgress = Math.min(offset / rect.height, 1);
      }
      if (newProgress !== progress) {
        setProgress(newProgress);
      }
    };
  }, [ref, progress]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const callback = () => onScroll.current?.();

    window.addEventListener('scroll', callback);

    return () => {
      window.removeEventListener('scroll', callback);
    };
  }, [onScroll, enabled]);

  return {
    ref,
    progress,
  };
};
