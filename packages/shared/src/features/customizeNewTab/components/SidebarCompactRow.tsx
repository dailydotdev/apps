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
  // Row is a non-semantic clickable region that simply forwards a pointer
  // click to the inner Switch's `onToggle`. We deliberately don't expose it
  // as a focusable button: that would create *two* tab stops for the same
  // logical control (the row + the native checkbox inside the Switch) and
  // double-announce the state to screen readers ("toggle, pressed" then
  // "checkbox, checked"). The checkbox inside the Switch is the canonical
  // a11y entry point; everything else is pointer affordance.
  //
  // The inner Switch is itself a <label> wrapping its <input>, so we wrap
  // it in a span that stops click propagation — otherwise a click on the
  // real switch would bubble up to this div and fire `onToggle` a second
  // time, immediately reverting the change.
  const handleRowClick = () => {
    if (disabled) {
      return;
    }
    onToggle();
  };
  return (
    // Pointer-only affordance that forwards clicks to the Switch; we
    // deliberately don't expose it to keyboard / AT (see the comment
    // above), so the matching a11y rules don't apply here.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      onClick={handleRowClick}
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
