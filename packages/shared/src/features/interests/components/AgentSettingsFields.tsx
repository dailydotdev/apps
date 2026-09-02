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
import { UserInterestCadence } from '../../../graphql/interests';

export const cadenceOptions = [
  { value: UserInterestCadence.Auto, label: 'Whenever it matters' },
  { value: UserInterestCadence.Hourly, label: 'Every hour' },
  { value: UserInterestCadence.Daily, label: 'Every day' },
  { value: UserInterestCadence.Weekly, label: 'Every week' },
];

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
    title="When it reports"
    hint="Whenever it matters lets the agent keep looking on its own and only reach out when it has something worth your time."
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

// Bands line up with the onboarding presets, so the slider never describes a
// value differently from the chip that set it.
const fomoHint = (threshold: number): string => {
  if (threshold >= 0.9) {
    return 'Only perfect matches. Everything else is ignored.';
  }

  if (threshold >= 0.7) {
    return 'Quality over quantity. You will miss some.';
  }

  if (threshold < 0.3) {
    return 'You will see more, including the borderline stuff.';
  }

  return 'A fair balance of quality and volume.';
};

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
    <SettingsSection title="FOMO vs quality" hint={fomoHint(threshold)}>
      <Slider
        min={0}
        max={0.95}
        step={0.05}
        value={[Math.min(threshold, 0.95)]}
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
          Only perfect matches
        </Typography>
      </FlexRow>
    </SettingsSection>
  );
};

export const HistorySection = ({
  value,
  disabled,
  onChange,
}: {
  value: boolean;
  disabled?: boolean;
  onChange: (showHistory: boolean) => void;
}): ReactElement => (
  <SettingsSection
    title="History"
    hint="Off shows only the latest update when you open this agent."
  >
    <Switch
      inputId="agent-show-history"
      name="agent-show-history"
      checked={value}
      disabled={disabled}
      onToggle={() => onChange(!value)}
    >
      Show history
    </Switch>
  </SettingsSection>
);

export const NotificationsSection = ({
  value,
  disabled,
  onChange,
}: {
  value: boolean;
  disabled?: boolean;
  onChange: (notification: boolean) => void;
}): ReactElement => (
  <SettingsSection
    title="Notifications"
    hint="A ping when something clears your bar. Nothing else."
  >
    <Switch
      inputId="agent-notifications"
      name="agent-notifications"
      checked={value}
      disabled={disabled}
      onToggle={() => onChange(!value)}
    >
      Notify me
    </Switch>
  </SettingsSection>
);
