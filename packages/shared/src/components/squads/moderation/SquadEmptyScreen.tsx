import React, { FC, ReactElement } from 'react';
import { IconProps, IconSize } from '../../Icon';
import {
  TypographyColor,
  Typography,
  TypographyType,
} from '../../typography/Typography';

interface SquadEmptyScreenProps {
  Icon: FC<IconProps>;
  title: string;
  description: string;
}

export function SquadEmptyScreen({
  Icon,
  title,
  description,
}: SquadEmptyScreenProps): ReactElement {
  return (
    <div className="flex w-full flex-col items-center gap-4 p-6 py-10">
      <Icon
        secondary
        size={IconSize.XXXLarge}
        className={TypographyColor.Disabled}
      />
      <Typography type={TypographyType.Title2} bold>
        {title}
      </Typography>
      <Typography
        className="text-center"
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
      >
        {description}
      </Typography>
    </div>
  );
}
