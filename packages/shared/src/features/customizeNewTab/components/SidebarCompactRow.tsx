import type { ComponentType, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { IconProps } from '../../../components/Icon';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Switch } from '../../../components/fields/Switch';

export type SidebarRowIcon = ComponentType<IconProps>;

interface RowBodyProps {
  label: ReactNode;
  description?: ReactNode;
  icon?: SidebarRowIcon;
  active: boolean;
  rightAdornment?: ReactNode;
}

const RowBody = ({
  label,
  description,
  icon: IconEl,
  active,
  rightAdornment,
}: RowBodyProps): ReactElement => (
  <>
    {IconEl ? (
      <IconEl
        size={IconSize.Size16}
        secondary={active}
        className={classNames(
          'shrink-0 transition-colors',
          active ? 'text-text-primary' : 'text-text-tertiary',
        )}
      />
    ) : null}
    <span className="flex min-w-0 flex-1 flex-col">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        className="truncate"
      >
        {label}
      </Typography>
      {description ? (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="break-words"
        >
          {description}
        </Typography>
      ) : null}
    </span>
    {rightAdornment}
  </>
);

// Hover shows the tint; focus-within only adds a ring (no background),
// so rows don't look "sticky-selected" after a click keeps the switch
// focused.
const ROW_BASE =
  'group flex min-h-9 items-center gap-3 rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-float focus-within:ring-2 focus-within:ring-accent-cabbage-default';

interface SwitchRowProps {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: SidebarRowIcon;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  /**
   * Required for screen readers when `label` is not a plain string.
   * Falls back to `label` when omitted.
   */
  ariaLabel?: string;
}

const labelToAriaLabel = (label: ReactNode, fallback?: string): string => {
  if (typeof label === 'string') {
    return label;
  }
  return fallback ?? 'toggle';
};

export const SidebarSwitchRow = ({
  name,
  label,
  description,
  icon,
  checked,
  onToggle,
  disabled,
  className,
  ariaLabel,
}: SwitchRowProps): ReactElement => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label
    htmlFor={`${name}-switch`}
    className={classNames(
      ROW_BASE,
      disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer',
      className,
    )}
  >
    <RowBody
      label={label}
      description={description}
      icon={icon}
      active={checked}
      rightAdornment={
        <Switch
          inputId={`${name}-switch`}
          name={name}
          compact
          checked={checked}
          onToggle={onToggle}
          disabled={disabled}
          aria-label={ariaLabel ?? labelToAriaLabel(label, name)}
        />
      }
    />
  </label>
);

interface ActionRowProps {
  label: ReactNode;
  description?: ReactNode;
  icon?: SidebarRowIcon;
  onClick: () => void;
  rightAdornment?: ReactNode;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const SidebarActionRow = ({
  label,
  description,
  icon,
  onClick,
  rightAdornment,
  disabled,
  className,
  ariaLabel,
}: ActionRowProps): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={classNames(
      ROW_BASE,
      'w-full text-left disabled:pointer-events-none disabled:opacity-50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
      className,
    )}
  >
    <RowBody
      label={label}
      description={description}
      icon={icon}
      active={false}
      rightAdornment={rightAdornment}
    />
  </button>
);
