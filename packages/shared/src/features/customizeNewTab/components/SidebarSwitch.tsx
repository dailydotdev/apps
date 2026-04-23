import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Switch } from '../../../components/fields/Switch';

interface SidebarSwitchProps {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onToggle: () => void;
  className?: string;
}

export const SidebarSwitch = ({
  name,
  label,
  description,
  checked,
  onToggle,
  className,
}: SidebarSwitchProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex items-start justify-between gap-4',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typography type={TypographyType.Callout} bold>
          {label}
        </Typography>
        {description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        )}
      </div>
      <Switch
        inputId={`${name}-switch`}
        name={name}
        compact={false}
        checked={checked}
        onToggle={onToggle}
      />
    </div>
  );
};
