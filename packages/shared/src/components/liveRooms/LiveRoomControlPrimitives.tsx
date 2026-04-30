import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  type IconType,
} from '../buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { ArrowIcon, VIcon } from '../icons';
import { Switch } from '../fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type {
  LiveRoomDeviceInfo,
  LiveRoomMicSettings,
  LiveRoomVideoQuality,
} from '../../contexts/LiveRoomContext';

export const AUDIO_ONLY_LABEL = 'Audio only';
export const HIDE_SELF_VIEW_LABEL = 'Hide my preview';
export const VIDEO_QUALITY_LABEL = 'Video quality';

export const VIDEO_QUALITY_ITEMS: {
  value: LiveRoomVideoQuality;
  label: string;
  description: string;
}[] = [
  {
    value: 'auto',
    label: 'Auto',
    description: 'Balance quality and bandwidth for most standups.',
  },
  {
    value: 'data_saver',
    label: 'Data saver',
    description: 'Prefer smaller remote video layers to reduce network use.',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Prefer the sharpest remote video when bandwidth allows.',
  },
];

export const MIC_SETTING_ITEMS: {
  key: keyof LiveRoomMicSettings;
  label: string;
  description: string;
}[] = [
  {
    key: 'noiseSuppression',
    label: 'Reduce background noise',
    description: 'Cut steady background sounds from your mic.',
  },
  {
    key: 'echoCancellation',
    label: 'Prevent speaker echo',
    description: 'Reduce echo when your speakers leak back into the mic.',
  },
  {
    key: 'autoGainControl',
    label: 'Keep my volume steady',
    description: 'Automatically balance quiet and loud moments.',
  },
];

export const Divider = (): ReactElement => (
  <span aria-hidden className="h-6 w-px shrink-0 bg-border-subtlest-tertiary" />
);

type SlashedIconProps = IconProps & {
  icon: ReactElement<IconProps>;
  slashed: boolean;
};

export const SlashedIcon = ({
  icon,
  slashed,
  className,
  ...rest
}: SlashedIconProps): ReactElement => (
  <span
    className={classNames(
      'relative inline-flex items-center justify-center',
      className,
    )}
  >
    {React.cloneElement(icon, rest)}
    {slashed ? (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="block h-[2px] w-[130%] rotate-45 rounded-max bg-status-error" />
      </span>
    ) : null}
  </span>
);

export const ControlGroup = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-1.5', className)}>
    {children}
  </div>
);

interface MicSettingRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const MicSettingRow = ({
  id,
  label,
  description,
  checked,
  disabled,
  onToggle,
}: MicSettingRowProps): ReactElement => (
  <div className="flex items-start justify-between gap-3 rounded-12 px-2 py-2">
    <div className="min-w-0 flex-1">
      <Typography type={TypographyType.Footnote} bold>
        {label}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </div>
    <Switch
      inputId={id}
      name={id}
      checked={checked}
      disabled={disabled}
      onToggle={onToggle}
      aria-label={label}
      className="shrink-0"
    />
  </div>
);

interface SelectSettingRowProps<TValue extends string> {
  label: string;
  description: string;
  value: TValue;
  options: {
    value: TValue;
    label: string;
  }[];
  onSelect: (value: TValue) => void;
}

export const SelectSettingRow = <TValue extends string>({
  label,
  description,
  value,
  options,
  onSelect,
}: SelectSettingRowProps<TValue>): ReactElement => (
  <div className="flex items-start justify-between gap-3 rounded-12 px-2 py-2">
    <div className="min-w-0 flex-1">
      <Typography type={TypographyType.Footnote} bold>
        {label}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          className="!min-w-[8.5rem] shrink-0 !justify-between !px-3 !font-normal !typo-callout"
        >
          {options.find((option) => option.value === value)?.label}
          <ArrowIcon className="ml-auto rotate-180" secondary />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex !min-w-[8.5rem] flex-col gap-1 !p-0"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="!h-auto"
          >
            <div className="flex w-full items-center justify-between gap-3">
              <Typography type={TypographyType.Footnote}>
                {option.label}
              </Typography>
              {value === option.value ? (
                <VIcon size={IconSize.Size16} secondary />
              ) : null}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

interface DeviceSplitButtonProps {
  isOn: boolean;
  isLoading: boolean;
  toggleAriaLabel: string;
  caretAriaLabel: string;
  caretMenuLabel: string;
  toggleIcon: IconType;
  onToggle: () => void;
  devices: LiveRoomDeviceInfo[];
  selectedId: string | null;
  onSelect: (deviceId: string) => void;
  emptyLabel: string;
  extra?: ReactNode;
}

export const DeviceSplitButton = ({
  isOn,
  isLoading,
  toggleAriaLabel,
  caretAriaLabel,
  caretMenuLabel,
  toggleIcon,
  onToggle,
  devices,
  selectedId,
  onSelect,
  emptyLabel,
  extra,
}: DeviceSplitButtonProps): ReactElement => {
  const variant = isOn ? ButtonVariant.Primary : ButtonVariant.Secondary;

  return (
    <div className="flex items-center">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={variant}
        icon={toggleIcon}
        loading={isLoading}
        aria-label={toggleAriaLabel}
        onClick={onToggle}
        className="!rounded-r-none"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={variant}
            icon={<ArrowIcon className="rotate-180" />}
            aria-label={caretAriaLabel}
            className="!w-6 !rounded-l-none !border-l-0 !px-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          side="top"
          className="min-w-[18rem]"
        >
          <div className="flex flex-col gap-1 px-1.5 py-1.5">
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="px-2 py-1 uppercase tracking-wide"
            >
              {caretMenuLabel}
            </Typography>
            {devices.length === 0 ? (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="px-2 py-2"
              >
                {emptyLabel}
              </Typography>
            ) : (
              devices.map((device) => {
                const isSelected = device.deviceId === selectedId;

                return (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => onSelect(device.deviceId)}
                    aria-label={device.label}
                  >
                    <span className="inline-flex flex-1 items-center gap-2">
                      <span
                        aria-hidden
                        className="flex size-4 shrink-0 items-center justify-center"
                      >
                        {isSelected ? (
                          <VIcon
                            size={IconSize.Size16}
                            className="text-text-primary"
                            secondary
                          />
                        ) : null}
                      </span>
                      <span className="truncate text-left">{device.label}</span>
                    </span>
                  </DropdownMenuItem>
                );
              })
            )}
            {extra ? (
              <div className="border-t border-border-subtlest-tertiary px-2 pt-2">
                {extra}
              </div>
            ) : null}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
