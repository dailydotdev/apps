import { LegacyRef, useEffect, useRef, useState } from 'react';

export type UseDynamicHeaderRet<T extends HTMLElement> = {
  ref: LegacyRef<T>;
  progress: number | undefined;
};

export type UseDynamicHeaderProps = {
  minOffset?: number;
  maxOffset: number;
};

export const useDynamicHeader = <T extends HTMLElement>({
  minOffset = 0,
  maxOffset,
}: UseDynamicHeaderProps): UseDynamicHeaderRet<T> => {
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
      if (offset >= minOffset) {
        newProgress = Math.min(
          (offset - minOffset) / (maxOffset - minOffset),
          1,
        );
      }
      if (newProgress !== progress) {
        setProgress(newProgress);
      }
    };
  }, [ref, progress, minOffset, maxOffset]);

  useEffect(() => {
    const callback = () => onScroll.current?.();

    window.addEventListener('scroll', callback);

    return () => {
      window.removeEventListener('scroll', callback);
    };
  }, [onScroll]);

  return {
    ref,
    progress,
  };
};
