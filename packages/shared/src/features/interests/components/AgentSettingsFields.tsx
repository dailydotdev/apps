import type { ReactElement, ReactNode } from 'react';
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
import type { InterestOutputModes } from '../../../graphql/interests';
import { UserInterestCadence } from '../../../graphql/interests';

export const cadenceOptions = [
  { value: UserInterestCadence.Hourly, label: 'Every hour' },
  { value: UserInterestCadence.Daily, label: 'Every day' },
  { value: UserInterestCadence.Weekly, label: 'Every week' },
];

export const outputOptions = [
  {
    key: 'feed',
    label: 'Add findings to my feed',
    short: 'feed',
    hint: 'Curated cards you can browse here',
  },
  {
    key: 'post',
    label: 'Write summary posts',
    short: 'posts',
    hint: 'A markdown recap of what it found',
  },
  {
    key: 'notification',
    label: 'Notify me about new content',
    short: 'notifications',
    hint: 'In-app and push ping when something lands',
  },
  {
    key: 'digest',
    label: 'Send a digest email',
    short: 'email digest',
    hint: 'Up to 5 picks, delivered at your chosen time',
  },
] as const;

export const SettingsSection = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
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

export const CadenceSection = ({
  value,
  disabled,
  onChange,
}: {
  value: UserInterestCadence;
  disabled?: boolean;
  onChange: (cadence: UserInterestCadence) => void;
}): ReactElement => (
  <SettingsSection
    title="When it runs"
    hint="How often the agent goes hunting for new content."
  >
    <Radio
      name="agent-cadence"
      value={value}
      options={cadenceOptions}
      disabled={disabled}
      onChange={onChange}
    />
  </SettingsSection>
);

export const FomoSection = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (fomoThreshold: number) => void;
}): ReactElement => {
  const [draft, setDraft] = useState<number | null>(null);
  const threshold = draft ?? value;

  return (
    <SettingsSection
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
        onValueChange={([next]) => setDraft(next)}
        onValueCommit={([next]) => onChange(next)}
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
    </SettingsSection>
  );
};

export const OutputModesSection = ({
  value,
  disabled,
  onChange,
}: {
  value: Partial<InterestOutputModes> | undefined;
  disabled?: boolean;
  onChange: (outputModes: Partial<InterestOutputModes>) => void;
}): ReactElement => (
  <SettingsSection title="What it delivers">
    {outputOptions.map(({ key, label, hint }) => (
      <FlexCol key={key} className="gap-0.5">
        <Switch
          inputId={`agent-output-${key}`}
          name={`agent-output-${key}`}
          checked={!!value?.[key]}
          disabled={disabled}
          onToggle={() => onChange({ [key]: !value?.[key] })}
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
  </SettingsSection>
);
