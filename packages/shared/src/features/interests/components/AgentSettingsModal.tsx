import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { ModalProps } from '../../../components/modals/common/Modal';
import { Modal } from '../../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../../components/modals/common/types';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { Switch } from '../../../components/fields/Switch';
import { Slider } from '../../../components/fields/Slider';
import { Radio } from '../../../components/fields/Radio';
import { HourDropdown } from '../../../components/fields/HourDropdown';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  UserInterestCadence,
  UserInterestStatus,
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
  <FlexCol className="gap-3 border-b border-border-subtlest-tertiary py-4 last:border-b-0">
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

export const AgentSettingsModal = ({
  onRequestClose,
  ...props
}: ModalProps): ReactElement => {
  const { interest, update, isUpdating } = useAgent();
  const [fomo, setFomo] = useState<number | null>(null);
  const [hour, setHour] = useState(8);
  const isStopped = interest?.status === UserInterestStatus.Stopped;
  const threshold = fomo ?? interest?.fomoThreshold ?? 0.5;

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Medium}
      isDrawerOnMobile
    >
      <Modal.Header title="Agent settings" />
      <Modal.Body className="!py-0">
        <Section
          title="When it runs"
          hint="How often the agent goes hunting, and when it delivers."
        >
          <Radio
            name="agent-cadence"
            value={interest?.cadence ?? UserInterestCadence.Daily}
            options={cadenceOptions}
            disabled={isUpdating || isStopped}
            onChange={(cadence) => update({ cadence })}
          />
          <FlexRow className="items-center justify-between gap-4">
            <Typography type={TypographyType.Callout}>
              Deliver around
            </Typography>
            <HourDropdown hourIndex={hour} setHourIndex={setHour} />
          </FlexRow>
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
          title="Stop the agent"
          hint="Pausing keeps everything it found. Stopping is permanent."
        >
          <FlexRow className="gap-2">
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              disabled={isUpdating || isStopped}
              onClick={() =>
                update({
                  status:
                    interest?.status === UserInterestStatus.Active
                      ? UserInterestStatus.Paused
                      : UserInterestStatus.Active,
                })
              }
            >
              {interest?.status === UserInterestStatus.Active
                ? 'Pause'
                : 'Resume'}
            </Button>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              disabled={isUpdating || isStopped}
              onClick={() => update({ status: UserInterestStatus.Stopped })}
            >
              Stop for good
            </Button>
          </FlexRow>
        </Section>
      </Modal.Body>
      <Modal.Footer>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={onRequestClose}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
