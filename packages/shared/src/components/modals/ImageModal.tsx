import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type ReactModal from 'react-modal';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import { useEventListener } from '../../hooks';

interface ImageModalProps extends ReactModal.Props {
  src: string;
  alt?: string;
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
}: ImageModalProps): ReactElement | null {
  const close = () => onRequestClose?.(undefined as never);

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

  // Lock background scroll while open. Restores the previous value on close so
  // a still-open underlying modal keeps its own lock (which is class-based).
  useEffect(() => {
    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = 'hidden';
    return () => {
      style.overflow = previousOverflow;
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
        src={src}
        alt={alt}
        className="relative max-h-full max-w-full rounded-16 object-contain"
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
