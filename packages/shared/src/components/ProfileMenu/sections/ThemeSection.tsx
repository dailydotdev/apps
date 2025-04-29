import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { MoonIcon, SunIcon } from '../../icons';
import { ThemeAutoIcon } from '../../icons/ThemeAuto';
import {
  ThemeMode,
  useSettingsContext,
  themes,
} from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import type { WithClassNameProps } from '../../utilities';

const ThemeIconMap = {
  [ThemeMode.Dark]: MoonIcon,
  [ThemeMode.Light]: SunIcon,
  [ThemeMode.Auto]: ThemeAutoIcon,
};

export const ThemeSection = ({
  className,
}: WithClassNameProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { setTheme, themeMode } = useSettingsContext();

  const onThemeToggle = useCallback(
    (newThemeMode: ThemeMode) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.Theme,
        target_id: newThemeMode,
      });
      return setTheme(newThemeMode);
    },
    [logEvent, setTheme],
  );

  return (
    <section
      className={classNames('flex items-center justify-between', className)}
    >
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Subhead}
      >
        Theme
      </Typography>

      <ButtonGroup>
        {themes.map((theme) => {
          const isActiveTheme = theme.value === themeMode;
          const Icon = ThemeIconMap[theme.value];

          return (
            <Button
              key={theme.value}
              icon={<Icon secondary={isActiveTheme} />}
              variant={
                isActiveTheme ? ButtonVariant.Float : ButtonVariant.Tertiary
              }
              size={ButtonSize.XSmall}
              onClick={() => onThemeToggle(theme.value)}
              className={isActiveTheme ? 'text-text-primary' : undefined}
            />
          );
        })}
      </ButtonGroup>
    </section>
  );
};
