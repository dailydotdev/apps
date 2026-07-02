import type {
  HTMLAttributes,
  ReactElement,
  Ref,
  MouseEventHandler,
} from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { ButtonV2 } from './ButtonV2';
import type { AllowedElements } from './ButtonV2';
import { ButtonSize, ButtonVariant, ButtonIconPosition } from './common';
import type { ColorName } from '../../styles/colors';
import InteractionCounter from '../InteractionCounter';

export type CardActionDensity = 'comfortable' | 'compact';

const densityToSize: Record<CardActionDensity, ButtonSize> = {
  comfortable: ButtonSize.Medium,
  compact: ButtonSize.Small,
};

// Larger than buttonSizeToIconSizeV2: engagement-bar icons sit closer
// to a 60% ratio (Material 3, Instagram, Reddit) so they read at a glance.
const densityToIconSize: Record<CardActionDensity, IconSize> = {
  comfortable: IconSize.Small,
  compact: IconSize.XSmall,
};

type IconElement = React.ReactElement<IconProps>;

type CardActionPassthroughProps = Omit<
  HTMLAttributes<AllowedElements>,
  | 'children'
  | 'className'
  | 'onClick'
  | 'aria-label'
  | 'aria-pressed'
  | 'aria-busy'
  | 'aria-disabled'
>;

type CardActionBaseProps = CardActionPassthroughProps & {
  icon: IconElement;
  iconPressed?: IconElement;
  label: string;
  count?: number | null;
  /** Override the counter formatter (defaults to `largeNumberFormat`). */
  countFormat?: (value: number | null) => string | null;
  color?: ColorName;
  pressed?: boolean;
  loading?: boolean;
  disabled?: boolean;
  density?: CardActionDensity;
  labelVisible?: boolean;
  className?: string;
  buttonClassName?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  href?: string;
};

function CardActionComponent(
  {
    icon,
    iconPressed,
    label,
    count,
    countFormat,
    color,
    pressed,
    loading,
    disabled,
    density = 'comfortable',
    labelVisible,
    className,
    buttonClassName,
    onClick,
    href,
    ...rest
  }: CardActionBaseProps,
  ref?: Ref<AllowedElements>,
): ReactElement {
  const size = densityToSize[density];
  const baseIcon = pressed && iconPressed ? iconPressed : icon;
  const renderIcon = baseIcon.props.size
    ? baseIcon
    : React.cloneElement(baseIcon, { size: densityToIconSize[density] });
  const showCount = typeof count === 'number' && count > 0;
  const showLabel = !!labelVisible;
  const hasContent = showCount || showLabel;

  return (
    <ButtonV2
      {...rest}
      ref={ref}
      tag={href ? 'a' : 'button'}
      href={href}
      variant={ButtonVariant.Tertiary}
      size={size}
      color={color}
      pressed={pressed}
      loading={loading}
      disabled={disabled}
      icon={renderIcon}
      iconPosition={ButtonIconPosition.Left}
      onClick={onClick}
      aria-label={label}
      className={classNames(
        hasContent && density === 'comfortable' && 'min-w-[2.5rem]',
        // Counter-only buttons tighten padding+gap to fit 5 actions
        // inside the 272px MIN feed-card width.
        showCount && !showLabel && '!gap-1 !px-1.5',
        'max-w-full',
        className,
        buttonClassName,
      )}
    >
      {hasContent && (
        // `card-action-content` is the hook target for responsive
        // collapse (see usePostActionsLabelVisibility + the
        // `.btn-v2:has(> .card-action-content.hidden)` rule).
        <span className="card-action-content inline-flex min-w-0 items-center gap-1 font-medium tabular-nums typo-footnote">
          {showLabel && (
            <span className="card-action-label truncate">{label}</span>
          )}
          {showCount && (
            <InteractionCounter value={count ?? 0} format={countFormat} />
          )}
        </span>
      )}
    </ButtonV2>
  );
}

export type CardActionProps = CardActionBaseProps & {
  ref?: Ref<AllowedElements>;
};

export const CardAction = forwardRef(CardActionComponent);
CardAction.displayName = 'CardAction';
