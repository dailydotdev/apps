import React from 'react';
import type { ReactNode } from 'react';
import { IconSize } from '../../components/Icon';
import { InfoIcon } from '../../components/icons';
import { SimpleTooltip } from '../../components/tooltips';
import {
  Typography,
  TypographyType,
} from '../../components/typography/Typography';

interface DataTileProps {
  label: string;
  value: number;
  info?: string;
  icon?: ReactNode;
}

export const DataTile: React.FC<DataTileProps> = ({
  label,
  value,
  info,
  icon,
}) => {
  return (
    <div className="flex flex-col gap-1 rounded-14 border border-border-subtlest-tertiary p-4">
      <span className="flex flex-row items-center gap-1">
        <Typography type={TypographyType.Footnote}>{label}</Typography>
        <SimpleTooltip content={info}>
          <InfoIcon size={IconSize.Size16} />
        </SimpleTooltip>
      </span>
      <span className="flex flex-row items-center gap-1">
        {icon}
        <Typography type={TypographyType.Title2} bold>
          {value}
        </Typography>
      </span>
    </div>
  );
};
