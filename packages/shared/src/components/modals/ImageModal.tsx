import type { ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import type ReactModal from 'react-modal';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import { useEventListener } from '../../hooks';

export interface ImageOriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ImageModalProps extends ReactModal.Props {
  src: string;
  alt?: string;
  /** Bounds of the thumbnail that was clicked, used to animate the image
   * expanding from it into the full view (a FLIP transition). */
  originRect?: ImageOriginRect;
}

/**
 * Full-screen image lightbox. Unlike the standard Modal card (fixed width + top
 * margins), this fills the viewport and centers the image on both axes, sizing
 * it with `max-h-full max-w-full object-contain` inside a padded container — so
 * the image is always fully visible and scales down with the screen while
 * preserving its aspect ratio. Mirrors the workspace-photos lightbox.
 *
 * Portaled into `document.body` so it stacks above the post modal (which lives
 * in its own body-level ReactModal portal); rendering inline would leave it
 * trapped under that portal at the same z-index.
 */
export default function ImageModal({
  onRequestClose,
  src,
  alt = 'Image',
  originRect,
}: ImageModalProps): ReactElement | null {
  const close = () => onRequestClose?.(undefined as never);
  const imgRef = useRef<HTMLImageElement>(null);
  const hasPlayedRef = useRef(false);

  // FLIP: render the image at its final centered size, but start it transformed
  // to sit exactly over the clicked thumbnail, then animate the transform away
  // so it visually grows/moves from the thumbnail into the full view.
  const playFlip = () => {
    const img = imgRef.current;
    if (!originRect || !img || hasPlayedRef.current) {
      return;
    }
    const final = img.getBoundingClientRect();
    if (!final.width || !final.height) {
      // Not laid out yet (image still loading) — onLoad will retry.
      return;
    }
    hasPlayedRef.current = true;
    const dx = originRect.left - final.left;
    const dy = originRect.top - final.top;
    const sx = originRect.width / final.width;
    const sy = originRect.height / final.height;
    img.style.transformOrigin = 'top left';
    img.style.transition = 'none';
    img.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    img.style.opacity = '1';
    // Two frames: let the browser paint the start transform first, then
    // transition to identity — doing both in one frame can coalesce and snap.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        img.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)';
        img.style.transform = 'none';
      });
    });
  };

  useLayoutEffect(() => {
    playFlip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on Escape, but only this lightbox: capture the event and stop it
  // before it reaches the underlying post modal's react-modal Esc handler —
  // otherwise Esc would close both at once.
  useEventListener(
    globalThis as unknown as Window,
    'keydown',
    (event) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.stopImmediatePropagation();
      event.preventDefault();
      close();
    },
    true,
  );

  // Lock background scroll while open. Compensate for the removed scrollbar
  // with matching padding so the page (and the FLIP's captured origin) doesn't
  // shift sideways when the lightbox opens. Restores the previous values on
  // close so a still-open underlying modal keeps its own (class-based) lock —
  // where the scrollbar is already gone, so the width is 0 and we add nothing.
  useEffect(() => {
    const { style } = document.body;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = style.overflow;
    const previousPaddingRight = style.paddingRight;
    style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      style.overflow = previousOverflow;
      style.paddingRight = previousPaddingRight;
    };
  }, []);

  const body = globalThis?.document?.body;
  if (!body) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-overlay-primary-pepper backdrop-blur-md"
        onClick={close}
      />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={playFlip}
        className={classNames(
          'relative max-h-full max-w-full rounded-16 object-contain',
          // With an origin we drive the entrance via the FLIP transform (start
          // hidden so a freshly-loaded image doesn't flash at full size first);
          // otherwise fall back to a simple centered zoom-in.
          originRect ? 'opacity-0' : 'animate-image-zoom-in',
        )}
      />
      {/* Pinned to the screen corner (not the image) so a busy image can't
          camouflage it. Primary (solid) variant stays visible over the dark
          overlay. */}
      <CloseButton
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="absolute right-4 top-4 z-1"
        onClick={close}
      />
    </div>,
    body,
  );
}
