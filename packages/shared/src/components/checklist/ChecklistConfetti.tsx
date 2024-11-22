import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  cloudinaryConfettiChecklist,
  cloudinaryConfettiChecklistBar,
} from '../../lib/image';

const cloudinaryConfetti = {
  checklist: cloudinaryConfettiChecklist,
  checklistBar: cloudinaryConfettiChecklistBar,
};

export type ChecklistConfettiProps = {
  className?: string;
  variant: keyof typeof cloudinaryConfetti;
};

export const ChecklistConfetti = ({
  className,
  variant,
}: ChecklistConfettiProps): ReactElement => {
  return (
    <div className={classNames(className, 'pointer-events-none absolute')}>
      <img src={cloudinaryConfetti[variant]} alt="Confetti" />
    </div>
  );
};
