import React, { useEffect, useRef, useState, useCallback } from 'react';
import classNames from 'classnames';

type SliderProps = {
  slides: React.ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: {
    container?: string;
    slide?: string;
  };
  enableSwipe?: boolean;
  transitionDuration?: number;
  autoPlayInterval?: number;
  showSingleSlide?: boolean;
};

type SliderRef = {
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  pauseAutoPlay: () => void;
  resumeAutoPlay: () => void;
};

const Slider = React.forwardRef<SliderRef, SliderProps>(
  (
    {
      slides,
      currentIndex,
      onIndexChange,
      className = {},
      enableSwipe = false,
      transitionDuration = 500,
      autoPlayInterval,
      showSingleSlide = false,
    },
    ref,
  ) => {
    const maxIndex = slides.length - 1;
    const slideRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [slideOffsets, setSlideOffsets] = useState<number[]>([]);
    const [isHovered, setIsHovered] = useState(false);
    const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

    const autoPlay = !!autoPlayInterval;

    if (slideRefs.current.length !== slides.length) {
      slideRefs.current = slides.map(() => React.createRef<HTMLDivElement>());
    }

    useEffect(() => {
      const calculateOffsets = () => {
        if (!containerRef.current) {
          return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const offsets: number[] = [];

        if (showSingleSlide) {
          slides.forEach((_, index) => {
            offsets[index] = -index * containerRect.width;
          });
        } else {
          const containerCenter = containerRect.width / 2;
          let cumulativeOffset = 0;
          slideRefs.current.forEach((slideRef, index) => {
            if (slideRef.current) {
              const slideRect = slideRef.current.getBoundingClientRect();
              const slideWidth = slideRect.width;

              const offsetToCenter =
                containerCenter - (cumulativeOffset + slideWidth / 2);
              offsets[index] = offsetToCenter;
              cumulativeOffset += slideWidth;
            }
          });
        }

        setSlideOffsets(offsets);
      };

      const timer = setTimeout(calculateOffsets, 100);

      window.addEventListener('resize', calculateOffsets);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculateOffsets);
      };
    }, [slides.length, showSingleSlide, slides]);

    const goToNext = useCallback(() => {
      if (currentIndex < maxIndex) {
        onIndexChange(currentIndex + 1);
      } else {
        onIndexChange(0);
      }
    }, [currentIndex, maxIndex, onIndexChange]);

    const goToPrevious = useCallback(() => {
      if (currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      } else {
        onIndexChange(maxIndex);
      }
    }, [currentIndex, maxIndex, onIndexChange]);

    const goToIndex = useCallback(
      (index: number) => {
        if (index >= 0 && index <= maxIndex) {
          onIndexChange(index);
        }
      },
      [maxIndex, onIndexChange],
    );

    const pauseAutoPlay = useCallback(() => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }, []);

    const resumeAutoPlay = useCallback(() => {
      if (autoPlay && !autoPlayTimerRef.current && !isHovered) {
        autoPlayTimerRef.current = setInterval(goToNext, autoPlayInterval);
      }
    }, [autoPlay, autoPlayInterval, goToNext, isHovered]);

    useEffect(() => {
      if (autoPlay && !isHovered) {
        autoPlayTimerRef.current = setInterval(goToNext, autoPlayInterval);
      } else {
        pauseAutoPlay();
      }

      return () => {
        if (autoPlayTimerRef.current) {
          clearInterval(autoPlayTimerRef.current);
        }
      };
    }, [autoPlay, autoPlayInterval, goToNext, isHovered, pauseAutoPlay]);

    const canGoNext = true;
    const canGoPrevious = true;

    React.useImperativeHandle(ref, () => ({
      goToNext,
      goToPrevious,
      goToIndex,
      canGoNext,
      canGoPrevious,
      pauseAutoPlay,
      resumeAutoPlay,
    }));

    const swipeHandlers = enableSwipe
      ? {
          onTouchStart: (e: React.TouchEvent) => {
            const touch = e.touches[0];
            (e.currentTarget as HTMLElement).dataset.startX =
              touch.clientX.toString();
          },
          onTouchEnd: (e: React.TouchEvent) => {
            const touch = e.changedTouches[0];
            const startX = parseFloat(
              (e.currentTarget as HTMLElement).dataset.startX || '0',
            );
            const endX = touch.clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                goToNext();
              } else {
                goToPrevious();
              }
            }
          },
        }
      : {};

    const currentOffset = slideOffsets[currentIndex] || 0;

    return (
      <div
        ref={containerRef}
        className={classNames(
          'relative h-full overflow-hidden',
          className.container,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...swipeHandlers}
      >
        <div
          className="flex h-full transition-transform ease-in-out"
          style={{
            transform: `translateX(${currentOffset}px)`,
            transitionDuration: `${transitionDuration}ms`,
          }}
        >
          {slides.map((slide, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              ref={slideRefs.current[index]}
              className={classNames(
                'h-full flex-shrink-0',
                showSingleSlide ? 'w-full' : 'w-80 px-1',
                className.slide,
              )}
            >
              <div className="rounded-lg h-full w-full">{slide}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

Slider.displayName = 'Slider';

export default Slider;
export type { SliderRef, SliderProps };
