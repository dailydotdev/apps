import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { questsFeature } from '../../../lib/featureManagement';
import { isExtension } from '../../../lib/func';
import {
  BellIcon,
  DiscussIcon,
  FeedbackIcon,
  FlagIcon,
  ReadingStreakIcon,
  StarIcon,
} from '../../../components/icons';
import { SidebarSection } from '../components/SidebarSection';
import {
  SidebarSwitchRow,
  type SidebarRowIcon,
} from '../components/SidebarCompactRow';

interface LoggedToggleArgs {
  targetId: string;
  next: boolean;
  toggle: () => Promise<unknown> | void;
}

interface WidgetDef {
  id: string;
  name: string;
  label: string;
  icon: SidebarRowIcon;
  checked: boolean;
  toggle: () => Promise<unknown> | void;
  enabled?: boolean;
}

export const WidgetsSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const {
    optOutReadingStreak,
    toggleOptOutReadingStreak,
    optOutLevelSystem,
    toggleOptOutLevelSystem,
    optOutQuestSystem,
    toggleOptOutQuestSystem,
    optOutCompanion,
    toggleOptOutCompanion,
    autoDismissNotifications,
    toggleAutoDismissNotifications,
    showFeedbackButton,
    toggleShowFeedbackButton,
  } = useSettingsContext();
  const { value: isQuestsEnabled } = useConditionalFeature({
    feature: questsFeature,
  });

  const logToggle = useCallback(
    ({ targetId, next, toggle }: LoggedToggleArgs) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: targetId,
        extra: JSON.stringify({ enabled: next }),
      });
      toggle();
    },
    [logEvent],
  );

  const widgets: WidgetDef[] = [
    {
      id: 'streak',
      name: 'newtab-customizer-streak',
      label: 'Reading streak',
      icon: ReadingStreakIcon,
      checked: !optOutReadingStreak,
      toggle: toggleOptOutReadingStreak,
    },
    isQuestsEnabled && {
      id: 'levels',
      name: 'newtab-customizer-levels',
      label: 'Levels',
      icon: StarIcon,
      checked: !optOutLevelSystem,
      toggle: toggleOptOutLevelSystem,
    },
    isQuestsEnabled && {
      id: 'quests',
      name: 'newtab-customizer-quests',
      label: 'Quests',
      icon: FlagIcon,
      checked: !optOutQuestSystem,
      toggle: toggleOptOutQuestSystem,
    },
    isExtension && {
      id: 'companion',
      name: 'newtab-customizer-companion',
      label: 'Companion widget',
      icon: DiscussIcon,
      checked: !optOutCompanion,
      toggle: toggleOptOutCompanion,
    },
    {
      id: 'feedback_button',
      name: 'newtab-customizer-feedback',
      label: 'Feedback button',
      icon: FeedbackIcon,
      checked: showFeedbackButton,
      toggle: toggleShowFeedbackButton,
    },
    {
      id: 'auto_dismiss_notifications',
      name: 'newtab-customizer-auto-dismiss',
      label: 'Auto-dismiss notifications',
      icon: BellIcon,
      checked: autoDismissNotifications,
      toggle: toggleAutoDismissNotifications,
    },
  ].filter(Boolean) as WidgetDef[];

  return (
    <SidebarSection title="Widgets">
      {widgets.map((widget) => (
        <SidebarSwitchRow
          key={widget.id}
          name={widget.name}
          label={widget.label}
          icon={widget.icon}
          checked={widget.checked}
          onToggle={() =>
            logToggle({
              targetId: widget.id,
              next: !widget.checked,
              toggle: widget.toggle,
            })
          }
        />
      ))}
    </SidebarSection>
  );
};
