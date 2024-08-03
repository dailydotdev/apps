import React, { InputHTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ChecklistAIcon } from '../icons';
import ConditionalWrapper from '../ConditionalWrapper';

interface CustomCheckboxProps {
  checked: boolean;
  title: string;
  description: string;
  onCheckboxToggle: () => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}
export const CardCheckbox = ({
  checked,
  title,
  description,
  onCheckboxToggle,
  inputProps = {},
  className,
}: CustomCheckboxProps): ReactElement => {
  return (
    <ConditionalWrapper
      condition={checked}
      wrapper={(component) => (
        <div
          className={classNames('h-full w-full rounded-16 p-px', className)}
          style={{
            backgroundImage: `linear-gradient(180deg, var(--theme-accent-onion-subtlest), var(--theme-accent-cabbage-default))`,
          }}
        >
          {component}
        </div>
      )}
    >
      <button
        type="button"
        className={classNames(
          'relative flex h-full w-full flex-col gap-2 rounded-16 px-3 py-4 hover:bg-surface-hover',
          !checked && 'border border-border-subtlest-secondary',
          !checked && className,
        )}
        onClick={onCheckboxToggle}
        style={{
          background:
            checked &&
            'color-mix(in srgb, var(--theme-background-default), transparent 8%)',
        }}
      >
        <input {...inputProps} type="checkbox" hidden />
        {checked && (
          <ChecklistAIcon className="absolute right-3 top-4 text-brand-default" />
        )}
        <Typography bold type={TypographyType.Title3}>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          className="text-left"
        >
          {description}
        </Typography>
      </button>
    </ConditionalWrapper>
  );
};
