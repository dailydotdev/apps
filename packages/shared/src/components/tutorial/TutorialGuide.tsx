import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { IconSize } from '../Icon';
import DrawnArrowIcon from '../icons/DrawnArrow';

type TutorialGuideProps = {
  className?: string;
  arrowPosition?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactNode;
};

const TutorialGuide = ({
  className,
  arrowPosition = 'left',
  children,
}: TutorialGuideProps): ReactElement => {
  const positionMapClassName = {
    top: 'flex-col',
    right: 'flex-row-reverse',
    bottom: 'flex-col-reverse',
  };
  const arrowMapClassName = {
    right: '-mt-6 -scale-x-100',
    bottom: 'rotate-180',
    left: '-mt-6',
  };

  return (
    <div
      className={classNames(
        'flex justify-center items-center',
        positionMapClassName[arrowPosition],
        className,
      )}
    >
      <DrawnArrowIcon
        className={arrowMapClassName[arrowPosition]}
        size={IconSize.Large}
      />
      {typeof children === 'string' ? (
        <span className="py-2 typo-title2 text-theme-label-primary">
          {children}
        </span>
      ) : (
        children
      )}
    </div>
  );
};

export default TutorialGuide;
