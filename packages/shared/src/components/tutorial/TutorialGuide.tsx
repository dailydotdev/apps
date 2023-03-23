import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { IconSize } from '../Icon';
import DrawnArrowIcon from '../icons/DrawnArrow';

type TutorialGuideProps = {
  className?: string;
  arrowPlacement?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactNode;
};

const TutorialGuide = ({
  className,
  arrowPlacement = 'left',
  children,
}: TutorialGuideProps): ReactElement => {
  const positionMapClassName = {
    top: 'flex-col',
    right: 'flex-row-reverse',
    bottom: 'flex-col-reverse',
  };
  const arrowMapClassName = {
    right: '-mt-6 -scale-x-100',
    bottom: 'mt-1 rotate-180',
    left: '-mt-6',
  };

  return (
    <div
      className={classNames(
        'flex justify-center items-center',
        positionMapClassName[arrowPlacement],
        className,
      )}
    >
      <DrawnArrowIcon
        className={arrowMapClassName[arrowPlacement]}
        size={IconSize.Large}
      />
      {typeof children === 'string' ? (
        <span className="typo-title2 text-theme-label-primary">{children}</span>
      ) : (
        children
      )}
    </div>
  );
};

export default TutorialGuide;
