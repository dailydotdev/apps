import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type {
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/common';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import { HighlightsPageSnapshotCard } from './HighlightsPageSnapshotCard';
import { SNAPSHOT_SIZE } from './snapshotGradient';

const CAPTURE_OPTIONS = {
  width: SNAPSHOT_SIZE,
  height: SNAPSHOT_SIZE,
  padding: 0,
  branded: false,
};

export interface HighlightsPageSnapshotButtonProps {
  headlines: string[];
  meta?: string;
  channel?: string;
  link?: string;
  seed?: string;
  showLabel?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

/**
 * The page-level offer: the top headlines as one card. Weaker than a single
 * highlight — five claims at thumbnail size is a wall — but it is the only
 * control that can ship without deciding anything about the rows.
 */
export function HighlightsPageSnapshotButton({
  headlines,
  meta,
  channel,
  link,
  seed,
  showLabel,
  size,
  variant,
}: HighlightsPageSnapshotButtonProps): ReactElement | null {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!headlines.length) {
    return null;
  }

  return (
    <>
      <SnapshotButton
        captureOptions={CAPTURE_OPTIONS}
        filename="daily-happening-now"
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
        <HighlightsPageSnapshotCard
          ref={cardRef}
          channel={channel}
          headlines={headlines}
          meta={meta}
          seed={seed}
        />
      </div>
    </>
  );
}
