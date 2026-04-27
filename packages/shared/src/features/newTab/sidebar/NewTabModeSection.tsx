import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { EarthIcon, TimerIcon } from '../../../components/icons';
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
import type { NewTabMode } from '../store/newTabMode.store';
import { useNewTabMode } from '../store/newTabMode.store';

const HINTS: Record<NewTabMode, string> = {
  discover: 'Your daily.dev feed every time you open a tab.',
  focus: 'Quiet the feed during deep work — pause now or schedule it.',
};

// Two modes only: Discover (the classic, infinite feed) and Focus (a
// commitment surface — runs a timer, can be scheduled, can block sites).
// Zen was removed in favour of this simpler split; the FocusSection below
// owns Pause-now, Active hours and Session length so the picker stays clean.
const OPTIONS: SegmentedOption<NewTabMode>[] = [
  { value: 'discover', label: 'Discover', icon: EarthIcon },
  { value: 'focus', label: 'Focus', icon: TimerIcon },
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
    </SidebarSection>
  );
};
