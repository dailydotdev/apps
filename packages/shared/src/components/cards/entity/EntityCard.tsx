import React from 'react';
import type { MouseEventHandler, ReactNode } from 'react';
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
  onClickCapture?: MouseEventHandler<HTMLDivElement>;
  onAuxClickCapture?: MouseEventHandler<HTMLDivElement>;
};

const EntityCard = ({
  children,
  className,
  actionButtons,
  image,
  type,
  entityName,
  permalink,
  onClickCapture,
  onAuxClickCapture,
}: EntityCardProps) => {
  return (
    <div
      onClickCapture={onClickCapture}
      onAuxClickCapture={onAuxClickCapture}
      className={classNames(
        'group/menu flex w-80 flex-col items-center rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4',
        className?.container,
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        {permalink ? (
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
        ) : (
          <div className={classNames(className?.image, 'overflow-hidden')}>
            <Image
              className="h-full w-full object-cover"
              src={image}
              alt={
                type === 'user'
                  ? `${entityName}'s user avatar`
                  : `${entityName}'s image`
              }
            />
          </div>
        )}
        <div className="flex items-center gap-2">{actionButtons}</div>
      </div>
      {children}
    </div>
  );
};

export default EntityCard;
