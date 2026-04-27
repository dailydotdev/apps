import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { questsFeature } from '../../../lib/featureManagement';
import { isExtension } from '../../../lib/func';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';
import {
  BellIcon,
  CoinIcon,
  DiscussIcon,
  FeedbackIcon,
  HotIcon,
  ReputationIcon,
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
  /** One-sentence explanation rendered inside the row's info tooltip. */
  tooltip: string;
  icon: SidebarRowIcon;
  iconSecondary?: boolean;
  checked: boolean;
  toggle: () => Promise<unknown> | void;
  enabled?: boolean;
}

export const WidgetsSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const {
    optOutReadingStreak,
    toggleOptOutReadingStreak,
    optOutLevelSystem,
    toggleOptOutLevelSystem,
    optOutQuestSystem,
    toggleOptOutQuestSystem,
    optOutCompanion,
    toggleOptOutCompanion,
    optOutCores,
    toggleOptOutCores,
    optOutReputation,
    toggleOptOutReputation,
    autoDismissNotifications,
    toggleAutoDismissNotifications,
    showFeedbackButton,
    toggleShowFeedbackButton,
  } = useSettingsContext();
  const { value: isQuestsEnabled } = useConditionalFeature({
    feature: questsFeature,
  });
  const hasCoresAccess = useHasAccessToCores();

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
  // server flags stay independent so other surfaces that read them
  // individually keep working; we just keep them in sync from this row.
  const isGamificationOn = !optOutLevelSystem && !optOutQuestSystem;
  const handleGamificationToggle = useCallback(async () => {
    const next = !isGamificationOn;
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'gamification',
      extra: JSON.stringify({ enabled: next }),
    });
    // We need to flip each opt-out flag whose current state disagrees with
    // the desired aggregate. For "next === true" that means opting in to any
    // currently-opted-out subsystem; for "next === false" the inverse.
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

  // Companion is gated behind a confirmation modal whenever the user tries
  // to enable it: we need their consent before requesting the broad host
  // permission Chrome will show. Disabling is unrestricted.
  const handleCompanionToggle = useCallback(() => {
    if (!optOutCompanion) {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'companion',
        extra: JSON.stringify({ enabled: false }),
      });
      toggleOptOutCompanion();
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'companion_permission_modal_open',
    });
    openModal({
      type: LazyModal.CompanionPermission,
      props: {
        onActivated: () => {
          logEvent({
            event_name: LogEvent.ChangeSettings,
            target_type: TargetType.CustomizeNewTab,
            target_id: 'companion',
            extra: JSON.stringify({ enabled: true }),
          });
          toggleOptOutCompanion();
        },
      },
    });
  }, [logEvent, openModal, optOutCompanion, toggleOptOutCompanion]);

  // All widget rows render outlined, gray icons so the section reads as a
  // uniform stack of toggles. ReputationIcon is the odd one out — its
  // primary glyph is filled and the outlined variant lives on `secondary`.
  const widgets: WidgetDef[] = [
    // Reputation badge in the header pill. Hides the number only — earned
    // reputation, the profile page, badges, and notifications are unaffected.
    {
      id: 'reputation',
      name: 'newtab-customizer-reputation',
      label: 'Reputation badge',
      tooltip:
        'Shows your reputation score in the header. Hides the number only — you keep earning reputation as you contribute.',
      icon: ReputationIcon,
      iconSecondary: true,
      checked: !optOutReputation,
      toggle: toggleOptOutReputation,
    },
    // Cores wallet pill in the header. Only show the row to users who
    // actually have access to Cores — for everyone else the toggle would be
    // a confusing no-op since the pill never renders for them anyway.
    hasCoresAccess && {
      id: 'cores',
      name: 'newtab-customizer-cores',
      label: 'Cores wallet',
      tooltip:
        'Shows your Cores balance in the header. Cores are the in-app currency you spend to award creators and unlock perks.',
      icon: CoinIcon,
      checked: !optOutCores,
      toggle: toggleOptOutCores,
    },
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
    isQuestsEnabled && {
      id: 'gamification',
      name: 'newtab-customizer-gamification',
      label: 'Gamification',
      tooltip:
        'Shows levels and quests — small daily challenges that reward you for staying current with your reading.',
      icon: StarIcon,
      checked: isGamificationOn,
      toggle: handleGamificationToggle,
    },
    isExtension && {
      id: 'companion',
      name: 'newtab-customizer-companion',
      label: 'Companion widget',
      tooltip:
        'Adds a small daily.dev side panel on every article you visit so you can comment, upvote, and share without leaving the page.',
      icon: DiscussIcon,
      checked: !optOutCompanion,
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
