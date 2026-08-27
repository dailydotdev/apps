import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../../../components/popover/Popover';
import type { DrawerRef } from '../../../components/drawers/Drawer';
import { Drawer } from '../../../components/drawers/Drawer';
import { useViewSize, ViewSize } from '../../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { Switch } from '../../../components/fields/Switch';
import { SettingsIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';

const cadenceCopy: Record<string, string> = {
  hourly: 'Runs every hour',
  daily: 'Runs every day',
  weekly: 'Runs every week',
};

const MenuRow = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactElement;
  label: string;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="-mx-1 flex items-center gap-2 rounded-8 px-1 py-1.5 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
  >
    {icon}
    <Typography type={TypographyType.Footnote} color={TypographyColor.Primary}>
      {label}
    </Typography>
  </button>
);

export const AgentSettingsMenu = (): ReactElement => {
  const { interest, status, update, isUpdating, setSettingsOpen } = useAgent();
  const isRunning = status === UserInterestStatus.Active;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<DrawerRef>(null);

  const trigger = (
    <button
      type="button"
      aria-label="Agent settings"
      className="agent-press group relative flex size-8 shrink-0 items-center justify-center rounded-10 transition-colors hover:bg-surface-hover"
      onClick={isLaptop ? undefined : () => setDrawerOpen(true)}
    >
      <SettingsIcon
        size={IconSize.XSmall}
        className="text-text-tertiary transition-colors group-hover:text-text-primary"
      />
    </button>
  );

  const openSettings = () => {
    if (isLaptop) {
      setSettingsOpen(true);
      return;
    }

    // Close the sheet before the page underneath changes; both at once reads
    // as a glitch.
    drawerRef.current?.onClose();
    setSettingsOpen(true);
  };

  const body = (
    <FlexCol className="gap-2">
      <FlexRow className="items-center justify-between gap-3">
        <FlexCol className="min-w-0 flex-1 gap-0.5">
          <Typography type={TypographyType.Footnote} bold>
            {isRunning ? 'Pause the agent' : 'Resume the agent'}
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="min-w-0 truncate"
          >
            {isRunning
              ? cadenceCopy[interest?.cadence ?? 'daily']
              : 'No scheduled runs'}
          </Typography>
        </FlexCol>
        <Switch
          inputId="agent-run-switch"
          name="agent-run-switch"
          compact
          checked={isRunning}
          disabled={isUpdating}
          onToggle={() =>
            update({
              status: isRunning
                ? UserInterestStatus.Paused
                : UserInterestStatus.Active,
            })
          }
        />
      </FlexRow>

      {interest?.lastRunAt && (
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
        >
          {'Last run '}
          <DateFormat date={interest.lastRunAt} type={TimeFormatType.Post} />
        </Typography>
      )}

      <span className="h-px bg-border-subtlest-tertiary" />

      <MenuRow
        icon={<SettingsIcon size={IconSize.Size16} />}
        label="Settings"
        onClick={openSettings}
      />
    </FlexCol>
  );

  if (!isLaptop) {
    return (
      <>
        {trigger}
        {isDrawerOpen && (
          <Drawer
            isOpen
            ref={drawerRef}
            appendOnRoot
            onClose={() => setDrawerOpen(false)}
            className={{ drawer: 'gap-2 px-4 pb-2 pt-3' }}
          >
            {body}
          </Drawer>
        )}
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="z-popup w-64 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-3"
      >
        {body}
      </PopoverContent>
    </Popover>
  );
};
