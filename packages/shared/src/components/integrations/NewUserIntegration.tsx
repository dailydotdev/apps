import React, { ReactElement } from 'react';

import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { IconProps } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export type NewUserIntegrationProps = {
  icon: ReactElement<IconProps>;
  onConnect: () => void;
  preText: string;
  text: string;
  buttonText?: string;
};

export const NewUserIntegration = ({
  icon,
  onConnect,
  preText,
  text,
  buttonText = 'Connect',
}: NewUserIntegrationProps): ReactElement => {
  return (
    <div className="flex items-center gap-2 px-1">
      {icon}
      <div className="flex flex-1 flex-col">
        <Typography
          type={TypographyType.Body}
          bold
          color={TypographyColor.Primary}
        >
          {preText}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {text}
        </Typography>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={onConnect}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
