import { useCallback, useMemo, useState } from 'react';
import type { CommunityPack, CommunityPackMember } from './communityPacks';

export interface PackSelection {
  isJoined: (pack: CommunityPack) => boolean;
  togglePack: (pack: CommunityPack) => void;
  joinedPacks: CommunityPack[];
  // Everything the joined packs bring in; packs never share a member.
  joinedMembers: CommunityPackMember[];
}

// Joining is staged here and committed on Continue, so any tap can be undone.
export const usePackSelection = (
  packs: CommunityPack[] | undefined,
): PackSelection => {
  const [joinedTags, setJoinedTags] = useState<string[]>([]);

  const isJoined = useCallback(
    ({ tag }: CommunityPack) => joinedTags.includes(tag),
    [joinedTags],
  );

  const togglePack = useCallback(
    ({ tag }: CommunityPack) =>
      setJoinedTags((current) =>
        current.includes(tag)
          ? current.filter((joined) => joined !== tag)
          : [...current, tag],
      ),
    [],
  );

  const joinedPacks = useMemo(
    () => packs?.filter(isJoined) ?? [],
    [isJoined, packs],
  );

  const joinedMembers = useMemo(
    () => joinedPacks.flatMap(({ members }) => members),
    [joinedPacks],
  );

  return { isJoined, togglePack, joinedPacks, joinedMembers };
};
