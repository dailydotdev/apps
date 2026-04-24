import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { SidebarSection } from '../../customizeNewTab/components/SidebarSection';
import { SidebarSwitchRow } from '../../customizeNewTab/components/SidebarCompactRow';
import {
  SidebarSegmented,
  type SegmentedOption,
} from '../../customizeNewTab/components/SidebarSegmented';
import { useNewTabMode } from '../store/newTabMode.store';
import {
  FOCUS_SESSION_PRESETS_MIN,
  useFocusSettings,
} from '../store/focusSession.store';

export const FocusSessionsSection = (): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { mode } = useNewTabMode();
  const { settings, setDefaultDuration, setEscapeFriction } =
    useFocusSettings();

  const handlePick = useCallback(
    (minutes: number) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_default_duration',
        extra: JSON.stringify({ minutes }),
      });
      setDefaultDuration(minutes);
    },
    [logEvent, setDefaultDuration],
  );

  const handleFrictionToggle = useCallback(() => {
    const next = !settings.escapeFriction;
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_escape_friction',
      extra: JSON.stringify({ enabled: next }),
    });
    setEscapeFriction(next);
  }, [logEvent, settings.escapeFriction, setEscapeFriction]);

  if (mode !== 'focus') {
    return null;
  }

  const presetOptions: SegmentedOption<string>[] =
    FOCUS_SESSION_PRESETS_MIN.map((minutes) => ({
      value: String(minutes),
      label: `${minutes}m`,
    }));

  return (
    <SidebarSection title="Layout">
      <div className="flex flex-col gap-1.5 px-1 py-1">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Default session length
        </Typography>
        <SidebarSegmented
          value={String(settings.defaultDurationMinutes)}
          options={presetOptions}
          onChange={(value) => handlePick(Number(value))}
          ariaLabel="Default session length"
        />
      </div>

      <SidebarSwitchRow
        name="focus-escape-friction"
        label="Confirm before ending early"
        checked={settings.escapeFriction}
        onToggle={handleFrictionToggle}
      />
    </SidebarSection>
  );
};
