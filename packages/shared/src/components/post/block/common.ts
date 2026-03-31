export type BlockTagSelection = Record<string, boolean>;

export interface DownvoteBlocked {
  tags?: BlockTagSelection;
  sourceIncluded?: boolean;
}

export const getBlockedLength = (blocked: DownvoteBlocked): number =>
  blocked?.tags
    ? Object.entries(blocked?.tags)?.filter(([, hasBlocked]) => hasBlocked)
        .length ?? 0
    : 0;

export const getBlockedMessage = (
  blockedTags: number,
  sourcePreferenceChanged: boolean,
): string => {
  if (sourcePreferenceChanged) {
    return 'Preferences saved';
  }

  if (blockedTags === 0) {
    return 'No topics were blocked';
  }

  const topic =
    blockedTags === 1 ? 'topic was blocked' : 'topics are now blocked';

  return `${blockedTags} ${topic}`;
};
