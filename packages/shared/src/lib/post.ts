export interface UpvoteCountDisplay {
  showCount: boolean;
  belowThresholdLabel: string;
}

function isRecentPost(
  createdAt: string | Date | undefined,
  newWindowHours: number,
): boolean {
  // Missing/invalid publish dates are treated as non-recent to avoid
  // showing a misleading below-threshold freshness label.
  if (!createdAt) {
    return false;
  }

  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) {
    return false;
  }

  const windowMs = Math.max(0, newWindowHours) * 60 * 60 * 1000;
  // Inclusive boundary is intentional: content exactly at the window limit
  // is still considered recent.
  return Date.now() - createdAtMs <= windowMs;
}

export function getUpvoteCountDisplay(
  numUpvotes: number,
  threshold: number,
  belowThresholdLabel: string,
  userHasUpvoted: boolean,
  createdAt?: string | Date,
  newWindowHours = 24,
): UpvoteCountDisplay {
  if (userHasUpvoted) {
    return { showCount: true, belowThresholdLabel: '' };
  }

  if (threshold <= 0) {
    if (numUpvotes <= 0) {
      return { showCount: false, belowThresholdLabel: '' };
    }

    return { showCount: true, belowThresholdLabel: '' };
  }

  if (numUpvotes >= threshold) {
    return { showCount: true, belowThresholdLabel: '' };
  }

  if (!isRecentPost(createdAt, newWindowHours)) {
    return { showCount: false, belowThresholdLabel: '' };
  }

  return { showCount: false, belowThresholdLabel };
}
