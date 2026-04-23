import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useConditionalFeature } from '../../../hooks';
import { featureNewTabMode } from '../../../lib/featureManagement';
import { SidebarSection } from '../../customizeNewTab/components/SidebarSection';
import { SidebarSwitch } from '../../customizeNewTab/components/SidebarSwitch';
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
  const { value: newTabModeVariant } = useConditionalFeature({
    feature: featureNewTabMode,
    shouldEvaluate: true,
  });

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

  // Only the `full` arm exposes Focus; fall back to hidden elsewhere.
  if (newTabModeVariant !== 'full' && mode !== 'focus') {
    return null;
  }

  return (
    <SidebarSection
      title="Focus sessions"
      description="Tune how focus mode starts and ends."
    >
      <div className="flex flex-col gap-2">
        <span className="font-bold text-text-primary typo-callout">
          Default length
        </span>
        <div
          role="radiogroup"
          aria-label="Default session length"
          className="flex flex-wrap gap-2"
        >
          {FOCUS_SESSION_PRESETS_MIN.map((minutes) => {
            const active = settings.defaultDurationMinutes === minutes;
            return (
              <button
                key={minutes}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handlePick(minutes)}
                className={classNames(
                  'rounded-10 border px-3 py-1 transition-colors typo-callout',
                  active
                    ? 'border-accent-cabbage-default bg-surface-float text-text-primary'
                    : 'border-border-subtlest-tertiary text-text-tertiary hover:bg-surface-float hover:text-text-primary',
                )}
              >
                {minutes} min
              </button>
            );
          })}
        </div>
      </div>

      <SidebarSwitch
        name="focus-escape-friction"
        label="Ask before ending early"
        description="Show a confirmation prompt when you try to break focus before the timer hits zero."
        checked={settings.escapeFriction}
        onToggle={handleFrictionToggle}
      />
    </SidebarSection>
  );
};
