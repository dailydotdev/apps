import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Badge } from '../tooltips/utils';
import { FlexCentered, FlexCol } from '../utilities';

interface ClassName {
  container?: string;
  banner?: string;
}

interface SquadTourCardProps {
  banner: string;
  title: string;
  badge?: string;
  description?: string;
  className?: ClassName;
}

function SquadTourCard({
  banner,
  title,
  description,
  badge,
  className,
}: SquadTourCardProps): ReactElement {
  return (
    <FlexCol className={className?.container}>
      <FlexCentered className="h-80 bg-gradient-to-l from-cabbage-90 to-cabbage-50">
        <img
          className={classNames(
            'w-full max-w-[23.5rem] pt-14',
            className?.banner,
          )}
          src={banner}
          alt={`${title} banner`}
        />
      </FlexCentered>
      <FlexCol className="p-6">
        <h3
          className={classNames(
            'flex flex-row items-center font-bold',
            description ? 'typo-title3' : 'typo-title1',
          )}
        >
          {badge && <Badge>{badge}</Badge>}
          {title}
        </h3>
        {description && (
          <p className="mt-2 typo-body text-theme-label-secondary">
            {description}
          </p>
        )}
      </FlexCol>
    </FlexCol>
  );
}

export default SquadTourCard;
