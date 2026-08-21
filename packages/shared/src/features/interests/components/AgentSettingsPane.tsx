import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { Switch } from '../../../components/fields/Switch';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { MoveToIcon, TrashIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  UserInterestCadence,
  UserInterestStatus,
  interestDisplayName,
} from '../../../graphql/interests';
import { useAgent } from '../AgentContext';
import {
  CadenceSection,
  FomoSection,
  OutputModesSection,
  SettingsSection,
} from './AgentSettingsFields';

const sourceOptions = [
  { key: 'dailyDev', label: 'daily.dev', disabled: false },
  { key: 'web', label: 'The web', disabled: true },
  { key: 'github', label: 'GitHub', disabled: true },
] as const;

export const AgentSettingsPane = ({
  onDelete,
  isDeleting,
}: {
  onDelete: () => void;
  isDeleting: boolean;
}): ReactElement => {
  const { interest, update, isUpdating, setSettingsOpen } = useAgent();
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);
  const isStopped = interest?.status === UserInterestStatus.Stopped;

  return (
    <>
      {/* Height must match the conversation and panel control rows, or
          switching between them shifts the frame. */}
      <FlexRow className="h-12 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:px-4">
        <Tooltip content="Back to the conversation">
          <Button
            icon={<MoveToIcon size={IconSize.XSmall} className="rotate-180" />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            aria-label="Back to the conversation"
            onClick={() => setSettingsOpen(false)}
          />
        </Tooltip>
        <Typography type={TypographyType.Footnote} bold>
          Settings
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="min-w-0 flex-1 truncate"
        >
          {interestDisplayName(interest)}
        </Typography>
      </FlexRow>

      <div className="agent-scroll min-h-0 flex-1 overflow-y-auto px-5 tablet:px-8 laptop:px-10">
        <FlexCol className="mx-auto w-full max-w-[45rem] pb-8">
          <CadenceSection
            value={interest?.cadence ?? UserInterestCadence.Daily}
            disabled={isUpdating || isStopped}
            onChange={(cadence) => update({ cadence })}
          />

          <FomoSection
            value={interest?.fomoThreshold ?? 0.5}
            onChange={(fomoThreshold) => update({ fomoThreshold })}
          />

          <OutputModesSection
            value={interest?.outputModes}
            disabled={isUpdating}
            onChange={(outputModes) => update({ outputModes })}
          />

          <SettingsSection
            title="Where it looks"
            hint="Web and GitHub discovery are coming next."
          >
            {sourceOptions.map(({ key, label, disabled }) => (
              <Switch
                key={key}
                inputId={`agent-source-${key}`}
                name={`agent-source-${key}`}
                checked={!!interest?.sources?.[key]}
                disabled={isUpdating || disabled}
                onToggle={() =>
                  update({ sources: { [key]: !interest?.sources?.[key] } })
                }
              >
                {label}
              </Switch>
            ))}
          </SettingsSection>

          <SettingsSection
            title="Delete this agent"
            hint="Its conversation and everything it found go with it. Pausing is in the settings menu if you only want it to stop hunting."
          >
            <FlexRow className="items-center gap-2">
              {isConfirmingDelete ? (
                <>
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Primary}
                    color={ButtonColor.Ketchup}
                    icon={<TrashIcon size={IconSize.Size16} />}
                    loading={isDeleting}
                    onClick={onDelete}
                  >
                    Yes, delete it
                  </Button>
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Keep it
                  </Button>
                </>
              ) : (
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Float}
                  icon={<TrashIcon size={IconSize.Size16} />}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete agent
                </Button>
              )}
            </FlexRow>
          </SettingsSection>
        </FlexCol>
      </div>
    </>
  );
};
