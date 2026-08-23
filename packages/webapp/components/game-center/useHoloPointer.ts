import type { CSSProperties, PointerEvent, RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';

const maxRotation = 14;

type HoloPointer = {
  ref: RefObject<HTMLDivElement>;
  isActive: boolean;
  style: CSSProperties;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
};

const neutral: CSSProperties = {
  '--pointer-x': '50%',
  '--pointer-y': '50%',
  '--background-x': '50%',
  '--background-y': '50%',
  '--rotate-x': '0deg',
  '--rotate-y': '0deg',
  '--card-opacity': 0,
} as CSSProperties;

/**
 * Pointer-driven holographic card, after simeydotme/pokemon-cards-css: the
 * cursor's position within the card feeds the tilt, the foil offset and the
 * glare centre as custom properties, so the CSS does all the painting.
 */
export const useHoloPointer = (): HoloPointer => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>(neutral);
  const [isActive, setIsActive] = useState(false);

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const percentX = ((event.clientX - rect.left) / rect.width) * 100;
    const percentY = ((event.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.min(100, Math.max(0, percentX));
    const clampedY = Math.min(100, Math.max(0, percentY));
    // Centre-relative, so the card tilts away from wherever the cursor is.
    const offsetX = clampedX - 50;
    const offsetY = clampedY - 50;

    setIsActive(true);
    setStyle({
      '--pointer-x': `${clampedX}%`,
      '--pointer-y': `${clampedY}%`,
      '--background-x': `${35 + clampedX / 3.4}%`,
      '--background-y': `${35 + clampedY / 3.4}%`,
      '--rotate-x': `${(offsetX / 50) * maxRotation}deg`,
      '--rotate-y': `${(-offsetY / 50) * maxRotation}deg`,
      '--card-opacity': 1,
    } as CSSProperties);
  }, []);

  const onPointerLeave = useCallback(() => {
    setIsActive(false);
    setStyle(neutral);
  }, []);

  return {
    ref,
    isActive,
    style,
    onPointerMove,
    onPointerLeave,
  };
};
