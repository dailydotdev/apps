export interface UpvoteCountDisplay {
  showCount: boolean;
  belowThresholdLabel: string;
}

export function getUpvoteCountDisplay(
  numUpvotes: number,
  threshold: number,
  belowThresholdLabel: string,
  userHasUpvoted: boolean,
): UpvoteCountDisplay {
  if (numUpvotes <= 0) {
    return { showCount: false, belowThresholdLabel: '' };
  }

  if (threshold <= 0 || userHasUpvoted || numUpvotes >= threshold) {
    return { showCount: true, belowThresholdLabel: '' };
  }

  return { showCount: false, belowThresholdLabel };
}
