import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { FlexCol } from '../../utilities';
import { VIcon } from '../../icons';
import { useSettingsBooleanFlag } from '../../../hooks/useSettingsBooleanFlag';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

const previewItems = ['Home', 'Explore', 'Saved'];

const SidebarPreview = ({
  withLabels,
}: {
  withLabels: boolean;
}): ReactElement => (
  <div
    aria-hidden
    className="flex h-28 gap-2 overflow-hidden rounded-10 border border-border-subtlest-tertiary bg-background-default p-2"
  >
    <div
      className={classNames(
        'flex flex-col items-center gap-1 rounded-8 bg-surface-float py-1',
        withLabels ? 'w-14' : 'w-8',
      )}
    >
      {previewItems.map((item) => (
        <div key={item} className="flex flex-col items-center gap-0.5">
          <span className="size-3 rounded-4 bg-text-quaternary" />
          {withLabels && (
            <span className="leading-none text-text-quaternary typo-caption2">
              {item}
            </span>
          )}
        </div>
      ))}
    </div>
    <div className="flex flex-1 flex-col gap-1.5">
      <span className="h-3 w-2/3 rounded-4 bg-surface-float" />
      <span className="h-6 w-full rounded-6 bg-surface-float" />
      <span className="h-6 w-full rounded-6 bg-surface-float" />
    </div>
  </div>
);

interface SidebarDensityOptionProps {
  title: string;
  description: string;
  isSelected: boolean;
  withLabels: boolean;
  onClick: () => void;
}

const SidebarDensityOption = ({
  title,
  description,
  isSelected,
  withLabels,
  onClick,
}: SidebarDensityOptionProps): ReactElement => (
  <button
    type="button"
    aria-pressed={isSelected}
    onClick={onClick}
    className={classNames(
      'flex flex-col gap-3 rounded-14 border p-3 text-left transition-colors',
      isSelected
        ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
        : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
    )}
  >
    <SidebarPreview withLabels={withLabels} />
    <FlexCol className="gap-0.5">
      <span className="flex items-center gap-1">
        <Typography bold type={TypographyType.Footnote}>
          {title}
        </Typography>
        {isSelected && <VIcon className="text-accent-cabbage-default" />}
      </span>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </FlexCol>
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
    <FlexCol className="gap-2">
      <Typography bold type={TypographyType.Subhead}>
        Sidebar
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Choose how the navigation sidebar looks on desktop.
      </Typography>

      <div className="mt-1 grid grid-cols-2 gap-3">
        <SidebarDensityOption
          title="Comfortable"
          description="Icons with labels underneath"
          isSelected={!isCompact}
          withLabels
          onClick={() => onSelect(false)}
        />
        <SidebarDensityOption
          title="Compact"
          description="Icons only, narrower sidebar"
          isSelected={isCompact}
          withLabels={false}
          onClick={() => onSelect(true)}
        />
      </div>
    </FlexCol>
  );
};
