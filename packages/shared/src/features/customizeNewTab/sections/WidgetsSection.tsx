import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useDndContext } from '../../../contexts/DndContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { questsFeature } from '../../../lib/featureManagement';
import { isExtension } from '../../../lib/func';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  BellIcon,
  DiscussIcon,
  FeedbackIcon,
  FlagIcon,
  PauseIcon,
  ReadingStreakIcon,
  StarIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { SidebarSection } from '../components/SidebarSection';
import {
  SidebarActionRow,
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

interface PauseRowProps {
  isActive: boolean;
  expiration?: Date | string | null;
  onOpenDndModal: () => void;
  onUnpause: () => void;
}

/**
 * Renders as a single compact row that mirrors SidebarActionRow/SwitchRow.
 * - Inactive: clickable row; click opens the DND modal (which owns the
 *   preset/custom picker). Removes the awkward inline card we had before.
 * - Active: non-clickable row (so we can safely nest the Resume button),
 *   shows the expiration and a Resume control.
 */
const PauseRow = ({
  isActive,
  expiration,
  onOpenDndModal,
  onUnpause,
}: PauseRowProps): ReactElement => {
  if (!isActive) {
    return (
      <SidebarActionRow
        label="Pause new tab"
        description="Temporarily hide the feed and notifications."
        icon={PauseIcon}
        onClick={onOpenDndModal}
      />
    );
  }

  const untilLabel = expiration
    ? `Paused until ${format(new Date(expiration), 'MMM d, h:mm a')}`
    : 'Paused';

  return (
    <div
      className={classNames(
        'flex min-h-9 items-center gap-3 rounded-10 bg-surface-float px-2 py-1.5',
      )}
    >
      <PauseIcon
        size={IconSize.Size16}
        secondary
        className="shrink-0 text-accent-cabbage-default"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} className="truncate">
          Pause new tab
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="break-words"
        >
          {untilLabel}
        </Typography>
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.XSmall}
        onClick={onUnpause}
      >
        Resume
      </Button>
    </div>
  );
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
  const { setShowDnd, onDndSettings, isActive, dndSettings } = useDndContext();
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

  const onOpenDndModal = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dnd_open',
    });
    setShowDnd(true);
  }, [logEvent, setShowDnd]);

  const onUnpause = useCallback(async () => {
    if (!onDndSettings) {
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dnd_unpause',
    });
    await onDndSettings(null);
  }, [logEvent, onDndSettings]);

  const showDndControls = isExtension && !!onDndSettings;

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
      {showDndControls ? (
        <PauseRow
          isActive={isActive}
          expiration={dndSettings?.expiration ?? null}
          onOpenDndModal={onOpenDndModal}
          onUnpause={onUnpause}
        />
      ) : null}

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
