import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { addDays, addHours, addMinutes, format } from 'date-fns';
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
  SidebarSwitchRow,
  type SidebarRowIcon,
} from '../components/SidebarCompactRow';

interface LoggedToggleArgs {
  targetId: string;
  next: boolean;
  toggle: () => Promise<unknown> | void;
}

interface DndPreset {
  id: string;
  label: string;
  getExpiration: () => Date;
}

const dndPresets: DndPreset[] = [
  {
    id: '30m',
    label: '30m',
    getExpiration: () => addMinutes(new Date(), 30),
  },
  { id: '1h', label: '1h', getExpiration: () => addHours(new Date(), 1) },
  { id: '2h', label: '2h', getExpiration: () => addHours(new Date(), 2) },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    getExpiration: () => addDays(new Date(), 1),
  },
];

const DND_FALLBACK_URL = 'chrome://new-tab-page';

interface WidgetDef {
  id: string;
  name: string;
  label: string;
  icon: SidebarRowIcon;
  checked: boolean;
  toggle: () => Promise<unknown> | void;
  enabled?: boolean;
}

const pillClass =
  'rounded-8 bg-background-default px-2.5 py-1 text-text-tertiary transition-colors typo-footnote hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default';

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

  const onPauseFor = useCallback(
    async (preset: DndPreset) => {
      if (!onDndSettings) {
        return;
      }
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'dnd_preset',
        extra: JSON.stringify({ preset: preset.id }),
      });
      await onDndSettings({
        expiration: preset.getExpiration(),
        link: DND_FALLBACK_URL,
      });
    },
    [logEvent, onDndSettings],
  );

  const onOpenDndModal = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dnd_custom',
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
        <div
          className={classNames(
            'flex flex-col gap-2 rounded-10 p-3',
            'ring-1 ring-border-subtlest-tertiary',
            isActive ? 'bg-surface-float' : 'bg-transparent',
          )}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <PauseIcon
              size={IconSize.Size16}
              secondary={isActive}
              className={classNames(
                'mt-0.5 shrink-0',
                isActive ? 'text-accent-cabbage-default' : 'text-text-tertiary',
              )}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <Typography type={TypographyType.Callout} bold>
                Pause new tab
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="break-words"
              >
                {isActive && dndSettings?.expiration
                  ? `Paused until ${format(
                      new Date(dndSettings.expiration),
                      'MMM d, h:mm a',
                    )}`
                  : 'Temporarily hide the feed and notifications.'}
              </Typography>
            </div>
          </div>
          {isActive ? (
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.XSmall}
              onClick={onUnpause}
              className="self-start"
            >
              Unpause now
            </Button>
          ) : (
            <div className="flex flex-wrap gap-1">
              {dndPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onPauseFor(preset)}
                  className={pillClass}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={onOpenDndModal}
                className={pillClass}
              >
                Custom…
              </button>
            </div>
          )}
        </div>
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
