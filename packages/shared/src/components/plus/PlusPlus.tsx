import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  TypographyType,
  TypographyColor,
  Typography,
} from '../typography/Typography';
import { PlusUser } from '../PlusUser';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { managePlusUrl } from '../../lib/constants';
import type { WithClassNameProps } from '../utilities/common';

export type PlusPlusProps = WithClassNameProps;

export const PlusPlus = ({ className }: PlusPlusProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex flex-1 flex-col items-center justify-center gap-4 text-center',
        className,
      )}
    >
      <PlusUser
        iconSize={IconSize.XSmall}
        typographyType={TypographyType.Callout}
      />
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Body}
          bold
          color={TypographyColor.Primary}
        >
          You're already a Plus member!
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Thanks for supporting daily.dev and unlocking our most powerful experience. Manage your subscription anytime to update your plan, payment details, or preferences.
        </Typography>
      </div>
      <Button
        tag="a"
        className="max-w-48"
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
        href={managePlusUrl}
        target="_blank"
      >
        Manage subscription
      </Button>
    </div>
  );
};
