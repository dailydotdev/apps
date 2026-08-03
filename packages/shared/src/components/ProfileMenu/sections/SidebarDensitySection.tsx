import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { VIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useSettingsBooleanFlag } from '../../../hooks/useSettingsBooleanFlag';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

const RailArt = ({ withLabels }: { withLabels: boolean }): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'flex flex-col items-center gap-1',
      withLabels ? 'w-7' : 'w-3',
    )}
  >
    {[0, 1, 2].map((row) => (
      <span key={row} className="flex flex-col items-center gap-0.5">
        <span className="size-2 rounded-2 bg-text-quaternary" />
        {withLabels && (
          <span className="h-0.5 w-4 rounded-2 bg-text-quaternary" />
        )}
      </span>
    ))}
  </span>
);

interface SidebarDensityOptionProps {
  label: string;
  isCompact: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const SidebarDensityOption = ({
  label,
  isCompact,
  isSelected,
  onClick,
}: SidebarDensityOptionProps): ReactElement => (
  <button
    type="button"
    aria-pressed={isSelected}
    onClick={onClick}
    className="flex flex-col items-center gap-1"
  >
    <span
      className={classNames(
        'relative flex h-14 w-16 items-center justify-center rounded-10 border transition-colors',
        isSelected
          ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
          : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
      )}
    >
      <RailArt withLabels={!isCompact} />
      {isSelected && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent-cabbage-default">
          <VIcon size={IconSize.XXSmall} className="text-white" />
        </span>
      )}
    </span>
    <Typography
      type={TypographyType.Caption1}
      className={classNames(
        'transition-colors',
        isSelected ? 'text-accent-cabbage-default' : 'text-text-tertiary',
      )}
    >
      {label}
    </Typography>
  </button>
);

export const SidebarDensitySection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { value: isCompact, set: setCompact } =
    useSettingsBooleanFlag('sidebarCompact');

  const onSelect = (compact: boolean) => {
    if (compact === isCompact) {
      return;
    }

    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.Layout,
      target_id: compact ? 'compact sidebar' : 'comfortable sidebar',
    });
    setCompact(compact).catch(() => undefined);
  };

  return (
    <div className="flex flex-row items-start justify-between gap-4">
      <div className="flex flex-1 flex-col gap-0.5 pt-1">
        <Typography type={TypographyType.Callout}>Sidebar</Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          Labels under the navigation icons
        </Typography>
      </div>
      <div className="flex shrink-0 gap-2">
        <SidebarDensityOption
          label="Comfortable"
          isCompact={false}
          isSelected={!isCompact}
          onClick={() => onSelect(false)}
        />
        <SidebarDensityOption
          label="Compact"
          isCompact
          isSelected={isCompact}
          onClick={() => onSelect(true)}
        />
      </div>
    </div>
  );
};
