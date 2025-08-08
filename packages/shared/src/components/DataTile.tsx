import React from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import { IconSize } from './Icon';
import { InfoIcon } from './icons';
import { Typography, TypographyType } from './typography/Typography';
import { Tooltip } from './tooltip/Tooltip';
import { formatDataTileValue } from '../lib/numberFormat';

interface DataTileProps {
  label: string;
  value: number;
  info?: string;
  icon?: ReactNode;
  subtitle?: ReactNode;
  className?: {
    container?: string;
  };
}

export const DataTile: React.FC<DataTileProps> = ({
  label,
  value,
  info,
  icon,
  subtitle,
  className,
}) => {
  return (
    <div
      className={classNames(
        'flex flex-col gap-1 rounded-14 border border-border-subtlest-tertiary p-4',
        className?.container,
      )}
    >
      <span className="flex flex-row items-center gap-1">
        <Typography type={TypographyType.Footnote}>{label}</Typography>
        <Tooltip content={info}>
          <span className="text-text-disabled">
            <InfoIcon size={IconSize.Size16} />
          </span>
        </Tooltip>
      </span>
      <span className="flex flex-row items-center gap-1">
        {icon}
        <Typography type={TypographyType.Title2} bold>
          {formatDataTileValue(value)}
        </Typography>
      </span>
      {subtitle}
    </div>
  );
};
