import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '../../../ConditionalWrapper';
import { ReusedCardCoverProps, SharedCardCover } from '../SharedCardCover';
import { CardImage } from './ListCard';
import { useViewSize, ViewSize } from '../../../../hooks';

interface CardCoverProps extends ReusedCardCoverProps {
  className?: string;
}

export function CardCoverList({
  className,
  imageProps,
  ...props
}: CardCoverProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const optimizedImageProps = useMemo(() => {
    const { src } = imageProps;

    return {
      ...imageProps,
      ...(!isLaptop && {
        src: src.replace('/f_auto,q_auto/', '/t_mobile_feed/'),
      }),
    };
  }, [imageProps, isLaptop]);

  return (
    <SharedCardCover
      {...props}
      imageProps={{
        ...optimizedImageProps,
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
