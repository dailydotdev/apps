import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useExtensionContext } from '../../../contexts/ExtensionContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useContentScriptStatus } from '../../../hooks/useContentScriptStatus';
import { LogEvent, TargetType } from '../../../lib/log';
import { BellIcon } from '../../../components/icons/Bell';
import { DiscussIcon } from '../../../components/icons/Discuss';
import { FeedbackIcon } from '../../../components/icons/Feedback';
import { HotIcon } from '../../../components/icons/Hot';
import { StarIcon } from '../../../components/icons/Star';
import { isExtension } from '../../../lib/func';
import { SidebarSection } from '../components/SidebarSection';
import {
  SidebarSwitchRow,
  type SidebarRowIcon,
} from '../components/SidebarCompactRow';

type WidgetDef = {
  id: string;
  name: string;
  label: string;
  /** One-sentence explanation rendered inside the row's hover tooltip. */
  tooltip: string;
  icon: SidebarRowIcon;
  iconSecondary?: boolean;
  checked: boolean;
  toggle: () => Promise<unknown> | void;
};

type LoggedToggleArgs = {
  targetId: string;
  next: boolean;
  toggle: () => Promise<unknown> | void;
};

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
  const { requestContentScripts } = useExtensionContext();
  const { contentScriptGranted } = useContentScriptStatus();
  // Visible state: companion is "on" only when the host permission is
  // granted AND the user hasn't opted out. Without the permission, the
  // companion can't actually run, so the toggle reflects reality (off).
  const isCompanionEnabled = !optOutCompanion && contentScriptGranted;

  const handleCompanionToggle = useCallback(async () => {
    const enabling = !isCompanionEnabled;
    if (!enabling) {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'companion',
        extra: JSON.stringify({ enabled: false }),
      });
      toggleOptOutCompanion();
      return;
    }
    // Enabling: prompt for the host permission if we don't already have
    // it. Once granted, the toggle becomes a regular on/off control on
    // future clicks.
    if (!contentScriptGranted) {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'companion_permission_request',
      });
      const granted =
        (await requestContentScripts?.({
          origin: 'customize_new_tab',
          skipRedirect: true,
        })) ?? false;
      if (!granted) {
        return;
      }
    }
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'companion',
      extra: JSON.stringify({ enabled: true }),
    });
    // Only flip the setting if it's currently opted out — otherwise a
    // permission-only grant (when `optOutCompanion=false` already) would
    // turn companion straight back off.
    if (optOutCompanion) {
      toggleOptOutCompanion();
    }
  }, [
    contentScriptGranted,
    isCompanionEnabled,
    logEvent,
    optOutCompanion,
    requestContentScripts,
    toggleOptOutCompanion,
  ]);

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

  // Gamification = Levels + Quests as one consumer-facing toggle. The two
  // server flags stay independent for other surfaces; we just keep them
  // in sync from this row.
  const isGamificationOn = !optOutLevelSystem && !optOutQuestSystem;
  const handleGamificationToggle = useCallback(async () => {
    const next = !isGamificationOn;
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'gamification',
      extra: JSON.stringify({ enabled: next }),
    });
    const ops: Array<Promise<unknown> | void> = [];
    if (optOutLevelSystem !== !next) {
      ops.push(toggleOptOutLevelSystem());
    }
    if (optOutQuestSystem !== !next) {
      ops.push(toggleOptOutQuestSystem());
    }
    await Promise.all(ops.filter(Boolean) as Array<Promise<unknown>>);
  }, [
    isGamificationOn,
    logEvent,
    optOutLevelSystem,
    optOutQuestSystem,
    toggleOptOutLevelSystem,
    toggleOptOutQuestSystem,
  ]);

  // All widget rows render outlined, gray icons so the section reads as a
  // uniform stack of toggles.
  const widgets: WidgetDef[] = [
    {
      id: 'streak',
      name: 'newtab-customizer-streak',
      label: 'Reading streak',
      tooltip:
        'Shows the flame counter that tracks how many days in a row you have read on daily.dev.',
      icon: HotIcon,
      checked: !optOutReadingStreak,
      toggle: toggleOptOutReadingStreak,
    },
    {
      id: 'gamification',
      name: 'newtab-customizer-gamification',
      label: 'Gamification',
      tooltip:
        'Shows levels and quests, small daily challenges that reward you for staying current with your reading.',
      icon: StarIcon,
      checked: isGamificationOn,
      toggle: handleGamificationToggle,
    },
    isExtension && {
      id: 'companion',
      name: 'newtab-customizer-companion',
      label: 'Companion widget',
      tooltip:
        'Side panel on every article you visit so you can comment, upvote and share without leaving the page. The first time you turn this on your browser will ask for permission to load on every site.',
      icon: DiscussIcon,
      checked: isCompanionEnabled,
      toggle: handleCompanionToggle,
    },
    {
      id: 'feedback_button',
      name: 'newtab-customizer-feedback',
      label: 'Feedback button',
      tooltip:
        'Floating button in the bottom-right that opens a quick form to send the daily.dev team your feedback.',
      icon: FeedbackIcon,
      checked: showFeedbackButton,
      toggle: toggleShowFeedbackButton,
    },
    {
      id: 'auto_dismiss_notifications',
      name: 'newtab-customizer-auto-dismiss',
      label: 'Auto-dismiss notifications',
      tooltip:
        'Marks in-app notifications as read automatically after you open the bell, instead of leaving the dot until you click each one.',
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
          tooltip={widget.tooltip}
          icon={widget.icon}
          iconTone="neutral"
          iconSecondary={widget.iconSecondary}
          checked={widget.checked}
          onToggle={() => {
            // Companion + Gamification own their own toggle/log flow.
            if (widget.id === 'companion' || widget.id === 'gamification') {
              widget.toggle();
              return;
            }
            logToggle({
              targetId: widget.id,
              next: !widget.checked,
              toggle: widget.toggle,
            });
          }}
        />
      ))}
    </SidebarSection>
  );
};
