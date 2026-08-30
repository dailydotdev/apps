import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { UserInterestCadence } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';
import {
  CadenceSection,
  FomoSection,
  NotificationsSection,
  cadenceOptions,
} from './AgentSettingsFields';

type Editable = 'cadence' | 'fomo' | 'notifications';

export const AgentReviewBlock = (): ReactElement => {
  const {
    interest,
    update,
    isUpdating,
    isOnboarding,
    isCompleting,
    completeOnboarding,
  } = useAgent();
  const [editing, setEditing] = useState<Editable>();

  const threshold = interest?.fomoThreshold ?? 0.5;
  const fomoSummary = (() => {
    if (threshold >= 0.9) {
      return 'Only perfect matches';
    }

    if (threshold >= 0.7) {
      return 'Quality over quantity';
    }

    return threshold < 0.3 ? 'Show me everything' : 'Balanced';
  })();

  const rows: { key: Editable; label: string; value: string }[] = [
    {
      key: 'cadence',
      label: 'When it reports',
      value:
        cadenceOptions.find(({ value }) => value === interest?.cadence)
          ?.label ?? 'Whenever it matters',
    },
    { key: 'fomo', label: 'FOMO vs quality', value: fomoSummary },
    {
      key: 'notifications',
      label: 'Notifications',
      value:
        interest?.outputModes?.notification === false ? 'Off' : 'Notify me',
    },
  ];

  return (
    <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <Typography type={TypographyType.Body} bold>
        Ready when you are
      </Typography>

      <FlexCol className="divide-y divide-border-subtlest-tertiary rounded-12 border border-border-subtlest-tertiary">
        {rows.map(({ key, label, value }) => (
          <FlexCol key={key}>
            <FlexRow className="items-center gap-3 px-3 py-2">
              <span className="w-32 shrink-0 text-text-quaternary typo-caption1">
                {label}
              </span>
              <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
                {value}
              </span>
              <Button
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                onClick={() =>
                  setEditing((current) => (current === key ? undefined : key))
                }
              >
                {editing === key ? 'Done' : 'Change'}
              </Button>
            </FlexRow>
            {editing === key && (
              <div className="border-t border-border-subtlest-tertiary px-3">
                {key === 'cadence' && (
                  <CadenceSection
                    value={interest?.cadence ?? UserInterestCadence.Auto}
                    disabled={isUpdating}
                    onChange={(cadence) => update({ cadence })}
                  />
                )}
                {key === 'fomo' && (
                  <FomoSection
                    value={threshold}
                    onChange={(fomoThreshold) => update({ fomoThreshold })}
                  />
                )}
                {key === 'notifications' && (
                  <NotificationsSection
                    value={interest?.outputModes?.notification ?? true}
                    disabled={isUpdating}
                    onChange={(notification) =>
                      update({ outputModes: { notification } })
                    }
                  />
                )}
              </div>
            )}
          </FlexCol>
        ))}
      </FlexCol>

      {isOnboarding ? (
        <FlexRow className="items-center gap-3 pt-1">
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            loading={isCompleting}
            onClick={completeOnboarding}
          >
            Start hunting
          </Button>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            or press Enter
          </Typography>
        </FlexRow>
      ) : (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Running. Change any of this in settings whenever you like.
        </Typography>
      )}
    </FlexCol>
  );
};
