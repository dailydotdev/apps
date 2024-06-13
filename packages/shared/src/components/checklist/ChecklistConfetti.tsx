import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { RankConfetti } from '../../svg/RankConfetti';

export type ChecklistConfettiProps = {
  className?: string;
};

export const ChecklistConfetti = ({
  className,
}: ChecklistConfettiProps): ReactElement => {
  return (
    <RankConfetti
      className={classNames(className, 'absolute inset-0 opacity-40')}
    />
  );
};
