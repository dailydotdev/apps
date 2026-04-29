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
import { InfoIcon } from '../../../components/icons/Info';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import ConditionalWrapper from '../../../components/ConditionalWrapper';

// Cap the tooltip width so a one-liner wraps cleanly into 2-3 lines
// instead of sprawling across the feed.
const ROW_TOOLTIP_CLASS = '!max-w-72 text-center';

export type SidebarRowIcon = ComponentType<IconProps>;

type RowBodyProps = {
  label: ReactNode;
  description?: ReactNode;
  icon?: SidebarRowIcon;
  active: boolean;
  iconTone?: 'default' | 'neutral';
  iconSecondary?: boolean;
  rightAdornment?: ReactNode;
  /**
   * When true, render a small decorative `InfoIcon` next to the label so
   * the row signals there's a tooltip to read. Tooltip wrapping itself
   * happens at the row level so hovering anywhere on the row reveals it.
   */
  hasTooltip?: boolean;
};

const RowBody = ({
  label,
  description,
  icon: IconEl,
  active,
  iconTone = 'default',
  iconSecondary,
  rightAdornment,
  hasTooltip,
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
      <span className="flex min-w-0 items-center gap-1">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          className="min-w-0 truncate"
        >
          {label}
        </Typography>
        {hasTooltip ? (
          <InfoIcon
            aria-hidden
            size={IconSize.XXSmall}
            className="shrink-0 text-text-quaternary"
          />
        ) : null}
      </span>
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

// Hover shows the tint; focus-within only adds a ring (no background)
// so rows don't look "sticky-selected" after a click keeps the switch
// focused.
const ROW_BASE =
  'group flex min-h-9 items-center gap-3 rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-float focus-within:ring-2 focus-within:ring-accent-cabbage-default';

export type SidebarSwitchRowProps = {
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
  ariaLabel?: string;
  /** One-sentence explanation surfaced via a row-wide hover tooltip. */
  tooltip?: ReactNode;
};

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
  tooltip,
}: SidebarSwitchRowProps): ReactElement => {
  // Row is a non-semantic clickable region that forwards a pointer click
  // to the inner Switch's `onToggle`. We deliberately don't expose it as
  // a focusable button: that would create *two* tab stops for the same
  // logical control. The Switch is the canonical a11y entry point.
  const handleRowClick = () => {
    if (disabled) {
      return;
    }
    onToggle();
  };
  return (
    <ConditionalWrapper
      condition={!!tooltip}
      wrapper={(component: ReactNode) => (
        <Tooltip
          content={tooltip}
          delayDuration={0}
          className={ROW_TOOLTIP_CLASS}
        >
          {component as ReactElement}
        </Tooltip>
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
          hasTooltip={!!tooltip}
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
    </ConditionalWrapper>
  );
};

export type SidebarActionRowProps = {
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
};

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
}: SidebarActionRowProps): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={classNames(
      ROW_BASE,
      'w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default disabled:pointer-events-none disabled:opacity-50',
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
