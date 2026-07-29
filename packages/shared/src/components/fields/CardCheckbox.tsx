import type { ComponentType, InputHTMLAttributes, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { VIcon } from '../icons';
import { IconSize } from '../Icon';
import { FunnelTargetId } from '../../features/onboarding/types/funnelEvents';

interface CustomCheckboxProps {
  checked: boolean;
  title: string;
  description: string;
  onCheckboxToggle: () => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  className?: string;
  // Optional: cards whose option has no icon mapped still lay out correctly.
  icon?: ComponentType<{ size?: IconSize; secondary?: boolean }>;
}

/**
 * A card-sized toggle, following the giveback cause cards: the whole card is
 * the target, selection is carried by a tinted fill AND a control that is
 * always visible — an empty ring when off, a filled check when on. The previous
 * version showed a check only when selected and nothing at all when not, so a
 * card that came pre-selected was indistinguishable from a decorative panel.
 */
export const CardCheckbox = ({
  checked,
  title,
  description,
  onCheckboxToggle,
  inputProps = {},
  className,
  icon: Icon,
}: CustomCheckboxProps): ReactElement => {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onCheckboxToggle}
      data-funnel-track={FunnelTargetId.FeedContentType}
      className={classNames(
        'group flex w-full items-start gap-3 rounded-16 border p-4 text-left transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none',
        checked
          ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
          : 'border-border-subtlest-tertiary hover:bg-surface-hover',
        className,
      )}
    >
      <input
        {...inputProps}
        type="checkbox"
        hidden
        readOnly
        checked={checked}
      />
      {Icon && (
        <span
          aria-hidden
          className={classNames(
            'flex size-8 shrink-0 items-center justify-center rounded-10 transition-colors',
            checked
              ? 'bg-accent-cabbage-default text-white'
              : 'bg-surface-float text-text-tertiary',
          )}
        >
          <Icon size={IconSize.Small} secondary={checked} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typography bold type={TypographyType.Callout}>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="[text-wrap:pretty]"
        >
          {description}
        </Typography>
      </span>
      <span
        aria-hidden
        className={classNames(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
          checked
            ? 'bg-accent-cabbage-default text-white'
            : 'border border-border-subtlest-secondary group-hover:border-accent-cabbage-default',
        )}
      >
        {checked && <VIcon secondary size={IconSize.XXSmall} />}
      </span>
    </button>
  );
};
