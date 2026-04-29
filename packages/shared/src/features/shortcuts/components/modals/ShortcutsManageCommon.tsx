import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';

interface SectionHeaderProps {
  title: string;
  description?: string;
  trailing?: ReactElement;
}

export function SectionHeader({
  title,
  description,
  trailing,
}: SectionHeaderProps): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <Typography bold type={TypographyType.Subhead}>
          {title}
        </Typography>
        {description && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        )}
      </div>
      {trailing}
    </div>
  );
}
