import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { SnapshotIcon } from '../../components/icons';
import { useSnapshotCapture } from './useSnapshotCapture';

export interface SnapshotButtonProps {
  /** The designed square card to rasterize, from this module. */
  card: ReactNode;
  /** Basename of the saved PNG, without the extension. */
  filename: string;
  className?: string;
  /** Renders the label beside the icon; icon-only without it. */
  label?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const SnapshotButton = ({
  card,
  filename,
  className,
  label,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
}: SnapshotButtonProps): ReactElement => {
  // The 1080px card only mounts once someone asks, so a feed of achievement
  // cards does not carry one render per row.
  const [isArmed, setIsArmed] = useState(false);
  const isPending = useRef(false);
  const { offScreenCard, shareImage, status } = useSnapshotCapture({
    card,
    filename,
    isActive: isArmed,
  });

  // The card rasterizes after it mounts, so the press arms the capture and the
  // share fires on the render that reports it ready.
  useEffect(() => {
    if (!isPending.current || status !== 'ready') {
      return;
    }

    isPending.current = false;
    shareImage();
  }, [status, shareImage]);

  return (
    <>
      <Button
        aria-label="Snapshot"
        className={className}
        icon={<SnapshotIcon />}
        loading={isArmed && status === 'loading'}
        onClick={() => {
          if (status === 'ready') {
            shareImage();
            return;
          }

          isPending.current = true;
          setIsArmed(true);
        }}
        size={size}
        type="button"
        variant={variant}
      >
        {label ? 'Snapshot' : undefined}
      </Button>
      {offScreenCard}
    </>
  );
};
