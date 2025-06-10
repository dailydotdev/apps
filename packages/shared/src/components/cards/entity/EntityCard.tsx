import React from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import { Image } from '../../image/Image';

export type EntityCardProps = {
  image: string;
  type: 'user' | 'source' | 'squad';
  children?: ReactNode;
  entityName?: string;
  actionButtons?: ReactNode | ReactNode[];
  className?: {
    container?: string;
    image?: string;
  };
};

const EntityCard = ({
  children,
  className,
  actionButtons,
  image,
  entityName,
}: EntityCardProps) => {
  return (
    <div
      className={classNames(
        'flex w-80 flex-col items-center rounded-16 bg-background-popover p-4',
        className?.container,
      )}
    >
      <div className="flex w-full items-center gap-2">
        <div className={classNames(className?.image, 'overflow-hidden')}>
          <Image src={image} alt={entityName} />
        </div>
        <div className="ml-auto flex items-center gap-2">{actionButtons}</div>
        <div />
      </div>
      {children}
    </div>
  );
};

export default EntityCard;
