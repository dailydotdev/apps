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
  iconTone?: 'default' | 'neutral';
  iconSecondary?: boolean;
  rightAdornment?: ReactNode;
}

const RowBody = ({
  label,
  description,
  icon: IconEl,
  active,
  iconTone = 'default',
  iconSecondary,
  rightAdornment,
}: RowBodyProps): ReactElement => (
  <>
    {IconEl ? (
      <IconEl
        size={IconSize.Size16}
        secondary={iconSecondary ?? (iconTone === 'default' && active)}
        className={classNames(
          'shrink-0 transition-colors',
          iconTone === 'neutral' &&
            '[&_*]:fill-current [&_*]:stroke-current text-text-tertiary',
          iconTone !== 'neutral' && active && 'text-text-primary',
          iconTone !== 'neutral' && !active && 'text-text-tertiary',
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
  iconTone?: 'default' | 'neutral';
  iconSecondary?: boolean;
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
  iconTone,
  iconSecondary,
  ariaLabel,
}: SwitchRowProps): ReactElement => {
  // The Switch component already wraps its <input> in its own <label>, so
  // we can't make the row another <label htmlFor=…> — both labels would
  // forward a single click to the input and onChange would fire twice,
  // flipping the toggle and immediately flipping it back. Instead the row
  // is a clickable <div> that calls onToggle directly, with the Switch
  // wrapper stopping propagation so a click on the actual switch toggles
  // exactly once.
  const handleRowClick = () => {
    if (disabled) {
      return;
    }
    onToggle();
  };
  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={checked}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel ?? labelToAriaLabel(label, name)}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
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
        iconTone={iconTone}
        iconSecondary={iconSecondary}
        rightAdornment={
          <span
            className="contents"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <Switch
              inputId={`${name}-switch`}
              name={name}
              compact
              checked={checked}
              onToggle={onToggle}
              disabled={disabled}
              aria-label={ariaLabel ?? labelToAriaLabel(label, name)}
            />
          </span>
        }
      />
    </div>
  );
};

interface ActionRowProps {
  label: ReactNode;
  description?: ReactNode;
  icon?: SidebarRowIcon;
  onClick: () => void;
  rightAdornment?: ReactNode;
  disabled?: boolean;
  className?: string;
  iconTone?: 'default' | 'neutral';
  iconSecondary?: boolean;
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
  iconTone,
  iconSecondary,
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
      iconTone={iconTone}
      iconSecondary={iconSecondary}
      rightAdornment={rightAdornment}
    />
  </button>
);
