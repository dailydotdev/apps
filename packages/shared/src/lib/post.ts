export interface UpvoteCountDisplay {
  showCount: boolean;
  belowThresholdLabel: string;
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

function isRecentPost(
  createdAt: string | Date | undefined,
  newWindowHours: number,
): boolean {
  if (!createdAt) {
    return false;
  }

  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) {
    return false;
  }

  const windowMs = Math.max(0, newWindowHours) * 60 * 60 * 1000;
  return Date.now() - createdAtMs <= windowMs;
}
