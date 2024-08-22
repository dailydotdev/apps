import React, { ReactElement } from 'react';
import classNames from 'classnames';

type SourceImageSize = 'size-24' | 'size-16' | 'size-14';

interface SourceImageProps {
  image?: string;
  title: string;
  icon: React.ReactNode;
  size?: SourceImageSize;
  className?: string;
}

export const SquadImage = ({
  image,
  title,
  icon,
  size = 'size-24',
  className,
}: SourceImageProps): ReactElement => {
  return image ? (
    <img
      className={classNames('rounded-full', size, className)}
      src={image}
      alt={`${title} source`}
    />
  ) : (
    <div
      className={classNames(
        'flex items-center justify-center rounded-full bg-accent-pepper-subtle',
        size,
        className,
      )}
    >
      {icon}
    </div>
  );
};
