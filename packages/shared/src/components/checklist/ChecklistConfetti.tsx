import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { cloudinary } from '../../lib/image';

export type ChecklistConfettiProps = {
  className?: string;
  variant: keyof typeof cloudinary.confetti;
};

export const ChecklistConfetti = ({
  className,
  variant,
}: ChecklistConfettiProps): ReactElement => {
  return (
    <div className={classNames(className, 'pointer-events-none absolute')}>
      <img src={cloudinary.confetti[variant]} alt="Confetti" />
    </div>
  );
};
