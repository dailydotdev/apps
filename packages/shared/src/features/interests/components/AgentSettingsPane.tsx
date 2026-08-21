import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { Switch } from '../../../components/fields/Switch';
import { Slider } from '../../../components/fields/Slider';
import { Radio } from '../../../components/fields/Radio';
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

const cadenceOptions = [
  { value: UserInterestCadence.Hourly, label: 'Every hour' },
  { value: UserInterestCadence.Daily, label: 'Every day' },
  { value: UserInterestCadence.Weekly, label: 'Every week' },
];

const outputOptions = [
  {
    key: 'feed',
    label: 'Add findings to my feed',
    hint: 'Curated cards you can browse here',
  },
  {
    key: 'post',
    label: 'Write summary posts',
    hint: 'A markdown recap of what it found',
  },
  {
    key: 'notification',
    label: 'Notify me about new content',
    hint: 'In-app and push ping when something lands',
  },
  {
    key: 'digest',
    label: 'Send a digest email',
    hint: 'Up to 5 picks, delivered at your chosen time',
  },
] as const;

const sourceOptions = [
  { key: 'dailyDev', label: 'daily.dev', disabled: false },
  { key: 'web', label: 'The web', disabled: true },
  { key: 'github', label: 'GitHub', disabled: true },
] as const;

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}): ReactElement => (
  <FlexCol className="gap-3 border-b border-border-subtlest-tertiary py-5 last:border-b-0">
    <FlexCol className="gap-0.5">
      <Typography type={TypographyType.Body} bold>
        {title}
      </Typography>
      {hint && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {hint}
        </Typography>
      )}
    </FlexCol>
    {children}
  </FlexCol>
);

export const AgentSettingsPane = ({
  onDelete,
  isDeleting,
}: {
  onDelete: () => void;
  isDeleting: boolean;
}): ReactElement => {
  const { interest, update, isUpdating, setSettingsOpen } = useAgent();
  const [fomo, setFomo] = useState<number | null>(null);
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);
  const isStopped = interest?.status === UserInterestStatus.Stopped;
  const threshold = fomo ?? interest?.fomoThreshold ?? 0.5;

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
          <Section
            title="When it runs"
            hint="How often the agent goes hunting for new content."
          >
            <Radio
              name="agent-cadence"
              value={interest?.cadence ?? UserInterestCadence.Daily}
              options={cadenceOptions}
              disabled={isUpdating || isStopped}
              onChange={(cadence) => update({ cadence })}
            />
          </Section>

          <Section
            title="FOMO vs quality"
            hint={
              threshold > 0.7
                ? 'Only the very best makes it through.'
                : 'You will see more, including the borderline stuff.'
            }
          >
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[threshold]}
              onValueChange={([value]) => setFomo(value)}
              onValueCommit={([value]) => update({ fomoThreshold: value })}
            />
            <FlexRow className="justify-between">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Show me everything
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Only the best
              </Typography>
            </FlexRow>
          </Section>

          <Section title="What it delivers">
            {outputOptions.map(({ key, label, hint }) => (
              <FlexCol key={key} className="gap-0.5">
                <Switch
                  inputId={`agent-output-${key}`}
                  name={`agent-output-${key}`}
                  checked={!!interest?.outputModes?.[key]}
                  disabled={isUpdating}
                  onToggle={() =>
                    update({
                      outputModes: { [key]: !interest?.outputModes?.[key] },
                    })
                  }
                >
                  {label}
                </Switch>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="pl-14"
                >
                  {hint}
                </Typography>
              </FlexCol>
            ))}
          </Section>

          <Section
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
          </Section>

          <Section
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
          </Section>
        </FlexCol>
      </div>
    </>
  );
};
