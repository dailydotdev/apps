import type { InputHTMLAttributes, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ChecklistAIcon } from '../icons';

interface CustomCheckboxProps {
  checked: boolean;
  title: string;
  description: string;
  onCheckboxToggle: () => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}

const border = {
  checked: `
    radial-gradient(
      circle at top left,
      var(--theme-accent-onion-subtlest),
      var(--theme-accent-cabbage-default)
    )
  `,
  unchecked: `
    radial-gradient(
      circle at top left,
      var(--theme-border-subtlest-tertiary),
      var(--theme-border-subtlest-tertiary)
    )
  `,
};

export const CardCheckbox = ({
  checked,
  title,
  description,
  onCheckboxToggle,
  inputProps = {},
  className,
}: CustomCheckboxProps): ReactElement => {
  return (
    <div
      className="flex rounded-16 p-px"
      style={{
        backgroundImage: `
          linear-gradient(
            var(--theme-background-default),
            var(--theme-background-default)
          ),
          ${checked ? border.checked : border.unchecked}
        `,
        backgroundClip: 'content-box, border-box',
        backgroundOrigin: 'border-box',
      }}
    >
      <button
        type="button"
        className={classNames(
          'relative flex h-full w-full flex-col gap-2 rounded-16 px-3 py-4',
          checked ? 'bg-surface-float' : 'hover:bg-surface-hover',
          className,
        )}
        onClick={onCheckboxToggle}
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
    </div>
  );
};
