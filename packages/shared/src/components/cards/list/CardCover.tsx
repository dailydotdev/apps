import React, { ReactElement } from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '../../ConditionalWrapper';
import {
  ReusedCardCoverProps,
  SharedCardCover,
} from '../common/SharedCardCover';
import { CardImage } from './ListCard';

interface CardCoverProps extends ReusedCardCoverProps {
  className?: string;
}

export function CardCoverList({
  className,
  imageProps,
  ...props
}: CardCoverProps): ReactElement {
  return (
    <SharedCardCover
      {...props}
      imageProps={{
        ...imageProps,
        className: classNames(imageProps.className, 'w-full mobileXL:w-60'),
      }}
      CardImageComponent={CardImage}
      renderOverlay={({ overlay, image }) => (
        <ConditionalWrapper
          condition={!!overlay}
          wrapper={(component) => (
            <div className={classNames('relative flex', className)}>
              {overlay}
              {component}
            </div>
          )}
        >
          {image}
        </ConditionalWrapper>
      )}
    />
  );
}
