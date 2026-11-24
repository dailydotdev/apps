import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import type { StreakQuestsSectionProps } from '../../components/sidebar/sections/StreakQuestsSection';
import { StreakQuestsSection } from '../../components/sidebar/sections/StreakQuestsSection';
import { getPatchyConfig } from './patchyConfig';
import { getPatchyMood } from './patchyTriggers';
import { PatchyRailIcon } from './PatchyRailIcon';
import {
  usePatchyAnchor,
  usePatchyPhoneCompanion,
} from './PatchyPhoneCompanion';
import { usePatchyRail } from './usePatchyRail';

// His face, idle animations and reactions, without the suggestion bubbles:
// the header has no room to show one.
const OwnPatchyHeaderIcon = (): ReactElement => {
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

// Shares the phone companion when the shell has one, so the pill and the
// floating face are the same Patchy: the pill marks his spot, and while he
// floats over it (the header scrolled away) it hides its own copy.
export const PatchyHeaderIcon = (): ReactElement => {
  const companion = usePatchyPhoneCompanion();
  const anchorRef = usePatchyAnchor('pill');
  if (!companion) {
    return <OwnPatchyHeaderIcon />;
  }
  const { patchy, state, hasReadToday, goalProgress, isFloating } = companion;

  return (
    <span
      ref={anchorRef}
      className={classNames('flex', isFloating && 'invisible')}
    >
      <PatchyRailIcon
        face={patchy.face}
        motion={patchy.motion}
        motionKey={patchy.motionKey}
        emote={patchy.emote}
        emoteCount={patchy.emoteCount}
        emoteKey={patchy.emoteKey}
        state={state}
        hasReadToday={hasReadToday}
        goalProgress={goalProgress}
      />
    </span>
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
