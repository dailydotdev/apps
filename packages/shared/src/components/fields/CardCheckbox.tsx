import type { ComponentType, ReactElement } from 'react';
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
  className?: string;
  icon?: ComponentType<{ size?: IconSize; secondary?: boolean }>;
}

export const CardCheckbox = ({
  checked,
  title,
  description,
  onCheckboxToggle,
  className,
  icon: Icon,
}: CustomCheckboxProps): ReactElement => {
  return (
    // A multi-select set, so `checkbox`, not a pressed toggle button. This ARIA
    // is all assistive tech gets — there is no real input behind it.
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
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
            : // The empty ring is the only thing marking an unselected card as
              // selectable, so it takes the strongest of the subtlest borders —
              // `secondary` is the same hue at 40% and washes out on light.
              'border border-border-subtlest-primary group-hover:border-accent-cabbage-default',
        )}
      >
        {checked && <VIcon secondary size={IconSize.XXSmall} />}
      </span>
    </button>
  );
};
