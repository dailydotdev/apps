import { useEffect, useRef, useState } from 'react';
import type { SliderRef } from '../components/containers/Slider';

export const useSlider = (slides: React.ReactNode[], startIndex?: number) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<SliderRef>(null);

  useEffect(() => {
    if (
      startIndex !== undefined &&
      startIndex >= 0 &&
      startIndex < slides.length
    ) {
      setCurrentIndex(startIndex);
    }
  }, [startIndex, slides.length]);

  const goToNext = () => sliderRef.current?.goToNext();
  const goToPrevious = () => sliderRef.current?.goToPrevious();

  return {
    currentIndex,
    setCurrentIndex,
    sliderRef,
    goToNext,
    goToPrevious,
  };
};
