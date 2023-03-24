import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { IconSize } from '../Icon';
import DrawnArrowIcon from '../icons/DrawnArrow';

type TutorialGuideProps = {
  className?: string;
  arrowPlacement?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactNode;
};

const positionToArrowClassName = {
  top: 'flex-col',
  right: 'flex-row-reverse',
  bottom: 'flex-col-reverse',
};
const positionToContainerClassName = {
  right: '-mt-6 -scale-x-100',
  bottom: 'mt-1 rotate-180',
  left: '-mt-6',
};

const TutorialGuide = ({
  className,
  arrowPlacement = 'left',
  children,
}: TutorialGuideProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex justify-center items-center',
        positionToArrowClassName[arrowPlacement],
        className,
      )}
    >
      <DrawnArrowIcon
        className={positionToContainerClassName[arrowPlacement]}
        size={IconSize.Large}
      />
      {typeof children === 'string' ? (
        <span className="laptop:typo-title2 typo-title3 text-theme-label-primary">
          {children}
        </span>
      ) : (
        children
      )}
    </div>
  );
};

export default TutorialGuide;
