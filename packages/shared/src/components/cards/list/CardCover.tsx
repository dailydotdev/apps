import React, { ReactElement } from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '../../ConditionalWrapper';
import {
  SharedCardCover,
  SharedCardCoverProps,
} from '../common/SharedCardCover';

interface CardCoverProps extends Omit<SharedCardCoverProps, 'renderOverlay'> {
  className?: string;
}

export function CardCoverList({
  className,
  ...props
}: CardCoverProps): ReactElement {
  return (
    <SharedCardCover
      {...props}
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
