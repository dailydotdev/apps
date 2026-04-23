import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { ThemeSection } from '../../../components/ProfileMenu/sections/ThemeSection';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import type { Spaciness } from '../../../graphql/settings';
import { SidebarSection } from '../components/SidebarSection';

const spacinessOptions: { value: Spaciness; label: string }[] = [
  { value: 'eco', label: 'Eco' },
  { value: 'roomy', label: 'Roomy' },
  { value: 'cozy', label: 'Cozy' },
];

interface SegmentedControlRowProps {
  label: string;
}

const SegmentedRow = ({
  label,
  children,
}: SegmentedControlRowProps & { children: ReactElement }): ReactElement => (
  <div className="flex items-center justify-between gap-4">
    <Typography color={TypographyColor.Tertiary} type={TypographyType.Subhead}>
      {label}
    </Typography>
    {children}
  </div>
);

export const AppearanceSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { insaneMode, toggleInsaneMode, spaciness, setSpaciness } =
    useSettingsContext();

  const onLayoutToggle = useCallback(
    async (isList: boolean) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.Layout,
        target_id: isList ? TargetId.List : TargetId.Cards,
        extra: JSON.stringify({ source: TargetType.CustomizeNewTab }),
      });
      return toggleInsaneMode(isList);
    },
    [logEvent, toggleInsaneMode],
  );

  const onSpacinessChange = useCallback(
    (value: Spaciness) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: `spaciness_${value}`,
      });
      setSpaciness(value);
    },
    [logEvent, setSpaciness],
  );

  return (
    <SidebarSection
      title="Appearance"
      description="Tune how daily.dev looks every time you open a tab."
    >
      <ThemeSection />

      <SegmentedRow label="Layout">
        <ButtonGroup>
          <Button
            variant={insaneMode ? ButtonVariant.Tertiary : ButtonVariant.Float}
            size={ButtonSize.XSmall}
            onClick={() => onLayoutToggle(false)}
            className={!insaneMode ? 'text-text-primary' : undefined}
          >
            Cards
          </Button>
          <Button
            variant={insaneMode ? ButtonVariant.Float : ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            onClick={() => onLayoutToggle(true)}
            className={insaneMode ? 'text-text-primary' : undefined}
          >
            List
          </Button>
        </ButtonGroup>
      </SegmentedRow>

      <SegmentedRow label="Density">
        <ButtonGroup>
          {spacinessOptions.map(({ value, label }) => {
            const isActive = value === spaciness;
            return (
              <Button
                key={value}
                variant={
                  isActive ? ButtonVariant.Float : ButtonVariant.Tertiary
                }
                size={ButtonSize.XSmall}
                onClick={() => onSpacinessChange(value)}
                className={isActive ? 'text-text-primary' : undefined}
              >
                {label}
              </Button>
            );
          })}
        </ButtonGroup>
      </SegmentedRow>
    </SidebarSection>
  );
};
