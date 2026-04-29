import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { NewTabMode } from '../../../graphql/settings';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { EarthIcon } from '../../../components/icons/Earth';
import { TimerIcon } from '../../../components/icons/Timer';
import { IconSize } from '../../../components/Icon';
import { SidebarSection } from '../components/SidebarSection';
import type { SidebarSegmentedOption } from '../components/SidebarSegmented';
import { SidebarSegmented } from '../components/SidebarSegmented';
import { normaliseNewTabMode } from '../lib/newTabMode';

const HINTS: Record<NewTabMode, string> = {
  discover: 'Your daily.dev feed every time you open a tab.',
  focus: 'Quiet the feed during deep work — pause now or schedule it.',
};

const MODE_OPTIONS: SidebarSegmentedOption<NewTabMode>[] = [
  {
    value: 'discover',
    label: 'Discover',
    icon: <EarthIcon size={IconSize.Size16} />,
    ariaLabel: 'Discover mode',
  },
  {
    value: 'focus',
    label: 'Focus',
    icon: <TimerIcon size={IconSize.Size16} />,
    ariaLabel: 'Focus mode',
  },
];

export const NewTabModeSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { flags, updateFlag } = useSettingsContext();
  const value = normaliseNewTabMode(flags?.newTabMode);

  const onSelect = useCallback(
    (next: NewTabMode) => {
      if (next === value) {
        return;
      }
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'new_tab_mode',
        extra: JSON.stringify({ mode: next }),
      });
      updateFlag('newTabMode', next);
    },
    [logEvent, updateFlag, value],
  );

  return (
    <SidebarSection title="Mode">
      <SidebarSegmented
        value={value}
        options={MODE_OPTIONS}
        onChange={onSelect}
      />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="break-words px-1"
      >
        {HINTS[value]}
      </Typography>
    </SidebarSection>
  );
};
