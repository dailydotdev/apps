import type { ReactElement } from 'react';
import React from 'react';
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
 */
export default function ImageModal({
  onRequestClose,
  src,
  alt = 'Image',
}: ImageModalProps): ReactElement {
  const close = () => onRequestClose?.(undefined as never);

  useEventListener(globalThis as unknown as Window, 'keydown', (event) => {
    if (event.key === 'Escape') {
      close();
    }
  });

  return (
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
    </div>
  );
}
