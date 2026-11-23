import type { ReactElement } from 'react';
import React, { useEffect, useId, useState } from 'react';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import type { StreakQuestsSectionProps } from '../../components/sidebar/sections/StreakQuestsSection';
import { StreakQuestsSection } from '../../components/sidebar/sections/StreakQuestsSection';
import { getPatchyConfig } from './patchyConfig';
import { getPatchyMood } from './patchyTriggers';
import { PatchyRailIcon } from './PatchyRailIcon';
import { usePatchyEnabled } from './usePatchyEnabled';
import { usePatchyRail } from './usePatchyRail';

// More than one streak button can show on a phone (the shell header and the
// feed tabs). Only the first one mounted gets Patchy, so there is one of him
// and his day isn't counted twice; the others keep the flame.
let owners: string[] = [];
const ownerListeners = new Set<() => void>();
const setOwners = (next: string[]) => {
  owners = next;
  ownerListeners.forEach((listener) => listener());
};

const usePatchyOwner = (isEnabled: boolean): boolean => {
  const id = useId();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }
    const update = () => setIsOwner(owners[0] === id);
    ownerListeners.add(update);
    setOwners([...owners, id]);
    return () => {
      ownerListeners.delete(update);
      setOwners(owners.filter((owner) => owner !== id));
      setIsOwner(false);
    };
  }, [isEnabled, id]);

  return isEnabled && isOwner;
};

// Patchy in the phone header's streak button: the flame's spot, like the
// Streak tab on the laptop rail.
export const usePatchyHeaderEnabled = ({
  shouldEvaluate,
}: {
  shouldEvaluate: boolean;
}): boolean => {
  const isFlagOn = usePatchyEnabled({ shouldEvaluate });
  return usePatchyOwner(shouldEvaluate && isFlagOn);
};

// His face, idle animations and reactions, without the suggestion bubbles:
// the header has no room to show one.
export const PatchyHeaderIcon = (): ReactElement => {
  const { isLoading, streak, state, hasReadToday, goalProgress } =
    useStreakRingState();
  const patchy = usePatchyRail({
    isEnabled: true,
    isStreakLoading: isLoading,
    state,
    hasReadToday,
    lastViewAt: streak?.lastViewAt,
    canSuggest: false,
  });

  return (
    <PatchyRailIcon
      face={patchy.face}
      motion={patchy.motion}
      motionKey={patchy.motionKey}
      emote={patchy.emote}
      emoteCount={patchy.emoteCount}
      emoteKey={patchy.emoteKey}
      state={state}
      hasReadToday={hasReadToday}
      goalProgress={goalProgress?.ratio}
    />
  );
};

// The phone drawer's streak panel, with his card on top like the rail panel.
export const PatchyStreakQuestsSection = (
  props: Omit<StreakQuestsSectionProps, 'patchyMood'>,
): ReactElement => {
  const { state, hasReadToday, streak } = useStreakRingState();
  const mood = getPatchyMood({
    state,
    hasReadToday,
    lastViewAt: streak?.lastViewAt,
    now: new Date(),
    config: getPatchyConfig(),
  });

  return <StreakQuestsSection {...props} patchyMood={mood} />;
};
