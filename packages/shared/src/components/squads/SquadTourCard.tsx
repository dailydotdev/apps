import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { Badge } from '../tooltips/utils';
import { FlexCol } from '../utilities';

interface ClassName {
  container?: string;
  banner?: string;
}

interface SquadTourCardProps {
  banner: string;
  title: string;
  badge?: ReactNode;
  children?: ReactNode;
  description?: string;
  className?: ClassName;
  bannerAsBg?: boolean;
}

function SquadTourCard({
  banner,
  bannerAsBg,
  title,
  description,
  badge,
  children,
  className,
}: SquadTourCardProps): ReactElement {
  return (
    <FlexCol className={className?.container}>
      <FlexCol
        className={classNames(
          'relative',
          !bannerAsBg &&
            'h-80 items-center justify-center bg-gradient-to-l from-raw-cabbage-90 to-raw-cabbage-50',
        )}
      >
        {bannerAsBg ? (
          <div
            className={classNames('w-full ', className?.banner)}
            style={{ backgroundImage: `url(${banner})` }}
          />
        ) : (
          <img
            className={classNames(
              'w-full max-w-[23.5rem] pt-14',
              className?.banner,
            )}
            src={banner}
            alt={`${title} banner`}
          />
        )}
      </FlexCol>
      <FlexCol className="p-6">
        <h3
          className={classNames(
            'flex flex-row items-center font-bold',
            description ? 'typo-title3' : 'typo-title1',
          )}
        >
          {typeof badge === 'string' ? <Badge>{badge}</Badge> : badge}
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-text-secondary typo-body">{description}</p>
        )}
      </FlexCol>
      {children}
    </FlexCol>
  );
}

export default SquadTourCard;
