import type { CaptureShareImageOptions } from '../../lib/imageShare/captureShareImage';
import { SNAPSHOT_MAX_HEIGHT, SNAPSHOT_SIZE } from './snapshotGradient';

/**
 * A designed card is 1080 wide and carries its own logo, so the capture only
 * has to match its height. Growing cards are measured rather than assumed, in
 * both directions: assuming the square would letterbox a long passage down to
 * a screenshot's worth of text, and pad a short one out with dead gradient.
 * An unmeasurable element falls back to the square.
 */
export function getSnapshotCaptureOptions(
  element?: HTMLElement | null,
): CaptureShareImageOptions {
  const measured = Math.round(element?.getBoundingClientRect().height ?? 0);

  return {
    width: SNAPSHOT_SIZE,
    height: measured ? Math.min(SNAPSHOT_MAX_HEIGHT, measured) : SNAPSHOT_SIZE,
    padding: 0,
  };
}
