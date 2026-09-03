import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { SnapshotIcon } from '../../components/icons';

export interface SnapshotButtonProps {
  className?: string;
  /** Renders the label beside the icon; icon-only without it. */
  label?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  /**
   * The capture seam. Rasterizing the surface lands with #6426, so callers
   * pass nothing yet and the control is a no-op.
   */
  onClick?: () => void;
}

export const SnapshotButton = ({
  className,
  label,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
  onClick,
}: SnapshotButtonProps): ReactElement => (
  <Button
    aria-label="Snapshot"
    className={className}
    icon={<SnapshotIcon />}
    onClick={onClick}
    size={size}
    type="button"
    variant={variant}
  >
    {label ? 'Snapshot' : undefined}
  </Button>
);
