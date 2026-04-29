import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import {
  ThemeMode,
  themes,
  useSettingsContext,
} from '../../../contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { MoonIcon } from '../../../components/icons/Moon';
import { SunIcon } from '../../../components/icons/Sun';
import { ThemeAutoIcon } from '../../../components/icons/ThemeAuto';
import type { IconProps } from '../../../components/Icon';
import { IconSize } from '../../../components/Icon';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { normaliseNewTabMode } from '../lib/newTabMode';
import { SidebarSection } from '../components/SidebarSection';
import type { SidebarSegmentedOption } from '../components/SidebarSegmented';
import { SidebarSegmented } from '../components/SidebarSegmented';

const ThemeIconMap: Record<ThemeMode, React.ComponentType<IconProps>> = {
  [ThemeMode.Dark]: MoonIcon,
  [ThemeMode.Light]: SunIcon,
  [ThemeMode.Auto]: ThemeAutoIcon,
};

type LayoutValue = 'cards' | 'list';

const LAYOUT_OPTIONS: SidebarSegmentedOption<LayoutValue>[] = [
  { value: 'cards', label: 'Cards', ariaLabel: 'Card layout' },
  { value: 'list', label: 'List', ariaLabel: 'List layout' },
];

type RowProps = {
  label: string;
  children: ReactElement;
};

const Row = ({ label, children }: RowProps): ReactElement => (
  <div className="flex min-w-0 items-center justify-between gap-3 px-1 py-1">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="shrink-0"
    >
      {label}
    </Typography>
    <div className="flex min-w-0 max-w-[60%] flex-1">{children}</div>
  </div>
);

export const AppearanceSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { insaneMode, toggleInsaneMode, themeMode, setTheme, flags } =
    useSettingsContext();
  const mode = normaliseNewTabMode(flags?.newTabMode);

  const onLayoutToggle = useCallback(
    async (next: LayoutValue) => {
      const isList = next === 'list';
      if (insaneMode === isList) {
        return;
      }
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.Layout,
        target_id: isList ? TargetId.List : TargetId.Cards,
        extra: JSON.stringify({ source: TargetType.CustomizeNewTab }),
      });
      await toggleInsaneMode(isList);
    },
    [insaneMode, logEvent, toggleInsaneMode],
  );

  const onThemeToggle = useCallback(
    (next: ThemeMode) => {
      if (next === themeMode) {
        return;
      }
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.Theme,
        target_id: next,
      });
      setTheme(next);
    },
    [logEvent, setTheme, themeMode],
  );

  // Card / List layout only affects feeds. In Focus mode the feed is
  // hidden behind the timer, so the toggle is a no-op the user can't
  // verify — drop it instead of showing dead UI.
  const showLayoutToggle = mode !== 'focus';

  const themeOptions: SidebarSegmentedOption<ThemeMode>[] = themes.map(
    (theme) => ({
      value: theme.value,
      label: theme.label,
      icon: React.createElement(ThemeIconMap[theme.value], {
        size: IconSize.Size16,
      }),
      iconOnly: true,
      ariaLabel: theme.label,
    }),
  );

  return (
    <SidebarSection title="Appearance">
      <Row label="Theme">
        <SidebarSegmented
          value={themeMode}
          options={themeOptions}
          onChange={onThemeToggle}
        />
      </Row>
      {showLayoutToggle ? (
        <Row label="Feed layout">
          <SidebarSegmented
            value={insaneMode ? 'list' : 'cards'}
            options={LAYOUT_OPTIONS}
            onChange={onLayoutToggle}
          />
        </Row>
      ) : null}
    </SidebarSection>
  );
};
