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
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { SidebarSection } from '../components/SidebarSection';
import { SidebarSwitch } from '../components/SidebarSwitch';

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

// Matches the values in packages/extension/src/newtab/dnd.ts — we duplicate
// them here instead of importing so the sidebar stays buildable from the
// shared package.
const dndPresets: DndPreset[] = [
  {
    id: '30m',
    label: '30 min',
    getExpiration: () => addMinutes(new Date(), 30),
  },
  { id: '1h', label: '1 hour', getExpiration: () => addHours(new Date(), 1) },
  { id: '2h', label: '2 hours', getExpiration: () => addHours(new Date(), 2) },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    getExpiration: () => addDays(new Date(), 1),
  },
];

// Same fallback as getDefaultLink() in the extension's dnd.ts so existing DND
// behaviour is preserved when a user triggers it from the sidebar.
const DND_FALLBACK_URL = 'chrome://new-tab-page';

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

  // DND is only wired up inside the extension; on web we simply drop the
  // block rather than render a broken control.
  const showDndControls = isExtension && !!onDndSettings;

  return (
    <SidebarSection
      title="New tab widgets"
      description="Pick what shows up on your new tab page."
    >
      <SidebarSwitch
        name="newtab-customizer-streak"
        label="Reading streak"
        description="Keep your daily streak visible to stay consistent."
        checked={!optOutReadingStreak}
        onToggle={() =>
          logToggle({
            targetId: 'streak',
            next: optOutReadingStreak,
            toggle: toggleOptOutReadingStreak,
          })
        }
      />

      {isQuestsEnabled && (
        <>
          <SidebarSwitch
            name="newtab-customizer-levels"
            label="Levels"
            description="Show your level progress as you earn XP."
            checked={!optOutLevelSystem}
            onToggle={() =>
              logToggle({
                targetId: 'levels',
                next: optOutLevelSystem,
                toggle: toggleOptOutLevelSystem,
              })
            }
          />
          <SidebarSwitch
            name="newtab-customizer-quests"
            label="Quests"
            description="Display the quest system across daily.dev."
            checked={!optOutQuestSystem}
            onToggle={() =>
              logToggle({
                targetId: 'quests',
                next: optOutQuestSystem,
                toggle: toggleOptOutQuestSystem,
              })
            }
          />
        </>
      )}

      {isExtension && (
        <SidebarSwitch
          name="newtab-customizer-companion"
          label="Companion widget"
          description="Floating daily.dev button next to every article you read."
          checked={!optOutCompanion}
          onToggle={() =>
            logToggle({
              targetId: 'companion',
              next: optOutCompanion,
              toggle: toggleOptOutCompanion,
            })
          }
        />
      )}

      <SidebarSwitch
        name="newtab-customizer-feedback"
        label="Feedback button"
        description="Show the floating Feedback pill in the bottom corner."
        checked={showFeedbackButton}
        onToggle={() =>
          logToggle({
            targetId: 'feedback_button',
            next: !showFeedbackButton,
            toggle: toggleShowFeedbackButton,
          })
        }
      />

      <SidebarSwitch
        name="newtab-customizer-auto-dismiss"
        label="Auto-dismiss notifications"
        description="Toasts disappear automatically after a few seconds."
        checked={autoDismissNotifications}
        onToggle={() =>
          logToggle({
            targetId: 'auto_dismiss_notifications',
            next: !autoDismissNotifications,
            toggle: toggleAutoDismissNotifications,
          })
        }
      />

      {showDndControls && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <Typography type={TypographyType.Callout} bold>
              Pause new tab
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {isActive && dndSettings?.expiration
                ? `Paused until ${format(
                    new Date(dndSettings.expiration),
                    'MMM d, h:mm a',
                  )}`
                : 'Temporarily hide the feed so you can focus.'}
            </Typography>
          </div>

          {isActive ? (
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={onUnpause}
            >
              Unpause now
            </Button>
          ) : (
            <>
              <ButtonGroup className="flex-wrap">
                {dndPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.XSmall}
                    className={classNames('flex-1')}
                    onClick={() => onPauseFor(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </ButtonGroup>
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                onClick={onOpenDndModal}
              >
                Custom…
              </Button>
            </>
          )}
        </div>
      )}
    </SidebarSection>
  );
};
