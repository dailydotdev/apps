import type { ReactElement } from 'react';
import React from 'react';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import type { StreakQuestsSectionProps } from '../../components/sidebar/sections/StreakQuestsSection';
import { StreakQuestsSection } from '../../components/sidebar/sections/StreakQuestsSection';
import { getPatchyConfig } from './patchyConfig';
import { getPatchyMood } from './patchyTriggers';
import { PatchyRailIcon } from './PatchyRailIcon';
import { usePatchyRail } from './usePatchyRail';

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
