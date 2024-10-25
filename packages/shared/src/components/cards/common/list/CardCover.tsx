import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '../../../ConditionalWrapper';
import { ReusedCardCoverProps, SharedCardCover } from '../SharedCardCover';
import { CardImage } from './ListCard';
import { useViewSize, ViewSize } from '../../../../hooks';
import { ImageProps } from '../../../image/Image';

interface CardCoverProps extends ReusedCardCoverProps {
  className?: string;
}

export function CardCoverList({
  className,
  imageProps,
  ...props
}: CardCoverProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const optimizedImageProps: ImageProps = useMemo(() => {
    const { src } = imageProps;
    const mobileSrc = src.replace('/f_auto,q_auto/', '/t_mobile_feed/');

    return {
      ...imageProps,
      ...(!isLaptop && {
        src: mobileSrc,
        srcSet: `${mobileSrc} 1x, ${src} 2x`,
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
