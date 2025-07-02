import React from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import Link from '../../utilities/Link';
import { Image } from '../../image/Image';

export type EntityCardProps = {
  image: string;
  type?: 'user' | 'source' | 'squad';
  children?: ReactNode;
  entityName?: string;
  actionButtons?: ReactNode | ReactNode[];
  className?: {
    container?: string;
    image?: string;
  };
  permalink?: string;
};

const EntityCard = ({
  children,
  className,
  actionButtons,
  image,
  type,
  entityName,
  permalink,
}: EntityCardProps) => {
  return (
    <div
      className={classNames(
        'flex w-80 flex-col items-center rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4',
        className?.container,
      )}
    >
      <div className="flex w-full items-start gap-2">
        <Link href={permalink}>
          <a className={classNames(className?.image, 'overflow-hidden')}>
            <Image
              className="h-full w-full object-cover"
              src={image}
              alt={
                type === 'user'
                  ? `${entityName}'s user avatar`
                  : `${entityName}'s image`
              }
            />
          </a>
        </Link>
        <div className="ml-auto flex items-center gap-2">{actionButtons}</div>
        <div />
      </div>
      {children}
    </div>
  );
};

export default EntityCard;
