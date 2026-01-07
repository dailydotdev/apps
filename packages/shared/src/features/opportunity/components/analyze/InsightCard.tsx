import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { InfoIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { Tooltip } from '../../../../components/tooltip/Tooltip';

type InsightCardProps = {
  label: string;
  tooltip: string;
  children: React.ReactNode;
  isLoading?: boolean;
};

export const InsightCard = ({
  label,
  tooltip,
  children,
  isLoading,
}: InsightCardProps) => {
  if (isLoading) {
    return (
      <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
        <div className="mb-3 flex items-center justify-between">
          <ElementPlaceholder className="rounded h-3 w-20" />
          <ElementPlaceholder className="rounded size-4" />
        </div>
        <div className="flex flex-col gap-2">
          <ElementPlaceholder className="rounded h-4 w-full" />
          <ElementPlaceholder className="rounded h-4 w-3/4" />
          <ElementPlaceholder className="rounded h-4 w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <Tooltip content={tooltip}>
      <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
        <div className="mb-3 flex items-center justify-between">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {label}
          </Typography>
          <InfoIcon size={IconSize.Size16} className="text-text-tertiary" />
        </div>
        {children}
      </div>
    </Tooltip>
  );
};
