import type { CaptureShareImageOptions } from '../../lib/imageShare/captureShareImage';
import { SNAPSHOT_MAX_HEIGHT, SNAPSHOT_SIZE } from './snapshotGradient';

/**
 * A designed card is 1080 wide and carries its own logo, so the capture only
 * has to match its height. Growing cards are measured rather than assumed:
 * hardcoding the square would letterbox a tall passage back down to a
 * screenshot's worth of text.
 */
export function getSnapshotCaptureOptions(
  element?: HTMLElement | null,
): CaptureShareImageOptions {
  const measured = element?.getBoundingClientRect().height ?? 0;

  return {
    width: SNAPSHOT_SIZE,
    height: Math.min(
      SNAPSHOT_MAX_HEIGHT,
      Math.max(SNAPSHOT_SIZE, Math.round(measured)),
    ),
    padding: 0,
    branded: false,
  };
}
