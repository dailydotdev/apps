import type { PointerEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { CropRect } from '../../lib/screenshot';
import { toNaturalRect } from '../../lib/screenshot';

const MIN_SELECTION_PX = 8;

interface ScreenshotCropperProps {
  src: string;
  onApply: (rect: CropRect) => void;
  onCancel: () => void;
}

export function ScreenshotCropper({
  src,
  onApply,
  onCancel,
}: ScreenshotCropperProps): ReactElement {
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<CropRect | null>(null);

  const getPoint = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    return {
      x: Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width),
      y: Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height),
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = getPoint(event);
    setSelection(null);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return;
    }

    const point = getPoint(event);
    setSelection({
      x: Math.min(dragStart.current.x, point.x),
      y: Math.min(dragStart.current.y, point.y),
      width: Math.abs(point.x - dragStart.current.x),
      height: Math.abs(point.y - dragStart.current.y),
    });
  };

  // Shared by pointerup, pointercancel, and lostpointercapture: an
  // OS-interrupted touch gesture must not leave a stale drag origin behind,
  // or the next hover would keep drawing a selection with no button pressed.
  const onPointerEnd = () => {
    dragStart.current = null;
    setSelection((current) =>
      current &&
      current.width >= MIN_SELECTION_PX &&
      current.height >= MIN_SELECTION_PX
        ? current
        : null,
    );
  };

  const onApplyClick = () => {
    const image = imageRef.current;
    const bounds = overlayRef.current?.getBoundingClientRect();

    if (!selection || !image || !bounds?.width || !bounds?.height) {
      return;
    }

    onApply(
      toNaturalRect(selection, bounds, {
        width: image.naturalWidth,
        height: image.naturalHeight,
      }),
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Drag to select the area to keep
      </Typography>
      <div className="relative w-fit max-w-full overflow-hidden">
        <img
          ref={imageRef}
          src={src}
          alt="Screenshot to crop"
          draggable={false}
          className="max-h-96 max-w-full select-none rounded-8 border border-border-subtlest-tertiary object-contain"
        />
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          ref={overlayRef}
          data-testid="crop-overlay"
          className="absolute inset-0 cursor-crosshair touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onLostPointerCapture={onPointerEnd}
        >
          {selection && (
            <div
              className="pointer-events-none absolute border border-text-primary bg-overlay-quaternary-pepper"
              style={{
                left: selection.x,
                top: selection.y,
                width: selection.width,
                height: selection.height,
              }}
            />
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onApplyClick}
          disabled={!selection}
        >
          Apply crop
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
