import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { EarthIcon, MoonIcon, TimerIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { SidebarSection } from '../../customizeNewTab/components/SidebarSection';
import {
  SidebarSegmented,
  type SegmentedOption,
} from '../../customizeNewTab/components/SidebarSegmented';
import { PauseNewTabRow } from '../../customizeNewTab/components/PauseNewTabRow';
import type { NewTabMode } from '../store/newTabMode.store';
import { useNewTabMode } from '../store/newTabMode.store';

const HINTS: Record<NewTabMode, string> = {
  discover: 'The endless daily.dev feed.',
  focus: 'Timer replaces the feed until the session ends.',
  zen: 'A calm homepage. Small briefing, no infinite feed.',
};

// Icon choices map to mental models:
// - Discover: a globe, because it reads as "the open stream from the world"
// - Focus:    a timer, unchanged, it's the clearest "session" metaphor
// - Zen:      a moon, because it's the most unambiguous "calm / quiet mode"
//   symbol and avoids clashing with the Brief card which already uses its
//   own briefing glyph.
const OPTIONS: SegmentedOption<NewTabMode>[] = [
  { value: 'discover', label: 'Discover', icon: EarthIcon },
  { value: 'focus', label: 'Focus', icon: TimerIcon },
  { value: 'zen', label: 'Zen', icon: MoonIcon },
];

export const NewTabModeSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { mode, setMode } = useNewTabMode();

  const onSelect = useCallback(
    (next: NewTabMode) => {
      if (next === mode) {
        return;
      }
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'new_tab_mode',
        extra: JSON.stringify({ mode: next }),
      });
      setMode(next);
    },
    [logEvent, mode, setMode],
  );

  return (
    <SidebarSection title="Mode">
      <SidebarSegmented
        value={mode}
        options={OPTIONS}
        onChange={onSelect}
        ariaLabel="New tab mode"
      />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="break-words px-1"
      >
        {HINTS[mode]}
      </Typography>
      {/* Pause sits alongside Mode because it's effectively a fourth "mode"
          (take a break). The row renders null outside the extension. */}
      <PauseNewTabRow />
    </SidebarSection>
  );
};
