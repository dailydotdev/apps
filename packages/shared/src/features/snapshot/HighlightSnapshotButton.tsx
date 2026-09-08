import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type {
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/common';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import type { HighlightSnapshotCardProps } from './HighlightSnapshotCard';
import { HighlightSnapshotCard } from './HighlightSnapshotCard';

export interface HighlightSnapshotButtonProps
  extends Omit<HighlightSnapshotCardProps, 'seed'> {
  id: string;
  link?: string;
  showLabel?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
}

/**
 * The card is staged off-screen at full size because the capture reads live
 * DOM — it has to be mounted before the press, not after.
 */
export function HighlightSnapshotButton({
  id,
  tldr,
  source,
  link,
  showLabel,
  size,
  variant,
  className,
}: HighlightSnapshotButtonProps): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <SnapshotButton
        className={className}
        filename={`daily-highlight-${id}`}
        link={link}
        showLabel={showLabel}
        size={size}
        target={cardRef}
        variant={variant}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-300vw] top-0"
      >
        <HighlightSnapshotCard
          ref={cardRef}
          seed={id}
          source={source}
          tldr={tldr}
        />
      </div>
    </>
  );
}
