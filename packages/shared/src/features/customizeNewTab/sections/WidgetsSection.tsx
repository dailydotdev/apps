import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useDndContext } from '../../../contexts/DndContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { questsFeature } from '../../../lib/featureManagement';
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
import { SidebarSection } from '../components/SidebarSection';
import { SidebarSwitch } from '../components/SidebarSwitch';

interface LoggedToggleArgs {
  targetId: string;
  next: boolean;
  toggle: () => Promise<unknown> | void;
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
  } = useSettingsContext();
  const { setShowDnd } = useDndContext();
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

  const onOpenDnd = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dnd',
    });
    setShowDnd(true);
  }, [logEvent, setShowDnd]);

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

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography type={TypographyType.Callout} bold>
            Do Not Disturb
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Hide the feed temporarily and stay focused.
          </Typography>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={onOpenDnd}
        >
          Set up
        </Button>
      </div>
    </SidebarSection>
  );
};
