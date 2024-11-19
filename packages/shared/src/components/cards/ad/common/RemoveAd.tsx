import React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../buttons/Button';
import { plusUrl } from '../../../../lib/constants';
import Link from '../../../utilities/Link';
import type { WithClassNameProps } from '../../../utilities';
import { usePlusSubscription } from '../../../../hooks/usePlusSubscription';

type Props = WithClassNameProps;

export const RemoveAd = ({ className }: Props): ReactElement => {
  const { isEnrolledNotPlus } = usePlusSubscription();
  if (!isEnrolledNotPlus) {
    return null;
  }

  return (
    <Link passHref href={plusUrl}>
      <Button
        tag="a"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        color={ButtonColor.Bacon}
        className={classNames('ml-auto', className)}
      >
        Remove
      </Button>
    </Link>
  );
};
