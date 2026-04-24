import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import {
  useSettingsContext,
  ThemeMode,
  themes,
} from '../../../contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { MoonIcon, SunIcon } from '../../../components/icons';
import { ThemeAutoIcon } from '../../../components/icons/ThemeAuto';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import type { IconProps } from '../../../components/Icon';
import { useNewTabMode } from '../../newTab/store/newTabMode.store';
import { SidebarSection } from '../components/SidebarSection';
import {
  SidebarSegmented,
  type SegmentedOption,
} from '../components/SidebarSegmented';

const ThemeIconMap: Record<ThemeMode, React.ComponentType<IconProps>> = {
  [ThemeMode.Dark]: MoonIcon,
  [ThemeMode.Light]: SunIcon,
  [ThemeMode.Auto]: ThemeAutoIcon,
};

type LayoutValue = 'cards' | 'list';

const LAYOUT_OPTIONS: SegmentedOption<LayoutValue>[] = [
  { value: 'cards', label: 'Cards' },
  { value: 'list', label: 'List' },
];

interface RowProps {
  label: string;
  children: ReactElement;
}

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
  const { insaneMode, toggleInsaneMode, themeMode, setTheme } =
    useSettingsContext();
  const { mode } = useNewTabMode();

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

  const themeOptions: SegmentedOption<ThemeMode>[] = themes.map((theme) => ({
    value: theme.value,
    label: theme.label,
    icon: ThemeIconMap[theme.value],
    iconOnly: true,
  }));

  return (
    <SidebarSection title="Appearance">
      <Row label="Theme">
        <SidebarSegmented
          value={themeMode}
          options={themeOptions}
          onChange={onThemeToggle}
          ariaLabel="Theme"
        />
      </Row>

      {showLayoutToggle ? (
        <Row label="Feed layout">
          <SidebarSegmented
            value={insaneMode ? 'list' : 'cards'}
            options={LAYOUT_OPTIONS}
            onChange={onLayoutToggle}
            ariaLabel="Feed layout"
          />
        </Row>
      ) : null}
    </SidebarSection>
  );
};
