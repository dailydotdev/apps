import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { SidebarSection } from '../components/SidebarSection';
import { SidebarSwitch } from '../components/SidebarSwitch';
import { useFocusMode } from '../store/focusMode.store';

export const FocusSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { isEnabled, setEnabled, setRevealed } = useFocusMode();

  const onToggle = useCallback(() => {
    const next = !isEnabled;

    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_mode',
      extra: JSON.stringify({ enabled: next }),
    });

    // Flipping focus mode always resets the reveal state so the user gets the
    // full zen layout when turning it on, and a clean slate when turning off.
    setRevealed(false);
    setEnabled(next);
  }, [isEnabled, logEvent, setEnabled, setRevealed]);

  return (
    <SidebarSection
      title="Focus mode"
      description="A calmer new tab with a personal greeting and just a handful of top posts. Scroll to bring the full feed back."
    >
      <SidebarSwitch
        name="newtab-customizer-focus-mode"
        label="Enable focus mode"
        description="Hide shortcuts and widgets. Show a hero greeting plus a short list of the best posts."
        checked={isEnabled}
        onToggle={onToggle}
      />
    </SidebarSection>
  );
};
