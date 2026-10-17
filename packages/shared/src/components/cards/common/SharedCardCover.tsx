import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { CommonCardCoverProps } from './common';
import type { ImageProps } from '../../image/Image';
import { ImageType } from '../../image/Image';
import type { VideoImageProps } from '../../image/VideoImage';
import VideoImage from '../../image/VideoImage';
import type { UseCardCoverProps } from '../../../hooks/feed/useCardCover';
import { useCardCover } from '../../../hooks/feed/useCardCover';
import { CardImage } from './Card';
import { TypographicCover } from './TypographicCover';
import { getCoverVariant } from '../../../lib/cover';
import { useFeature } from '../../GrowthBookProvider';
import { featureTypographicCover } from '../../../lib/featureManagement';

interface RenderProps {
  overlay: ReactNode;
  image: ReactNode;
}

export type ReusedCardCoverProps = Omit<
  SharedCardCoverProps,
  'renderOverlay' | 'CardImageComponent'
>;

export interface SharedCardCoverProps extends CommonCardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  isVideoType?: boolean;
  CardImageComponent: typeof CardImage;
  renderOverlay: (props: RenderProps) => ReactNode;
  coverClassName?: UseCardCoverProps['className'];
}

export function SharedCardCover({
  imageProps,
  videoProps,
  isVideoType,
  onShare,
  post,
  renderOverlay,
  CardImageComponent,
  coverClassName,
}: SharedCardCoverProps): ReactElement {
  const { overlay, shouldDimImage } = useCardCover({
    post,
    onShare,
    className: coverClassName,
  });
  const typographicCoverEnabled = useFeature(featureTypographicCover);
  const imageClasses = classNames(
    imageProps?.className,
    shouldDimImage && 'opacity-16',
  );

  if (isVideoType) {
    return (
      <VideoImage
        {...videoProps}
        CardImageComponent={CardImageComponent}
        overlay={overlay}
        imageProps={{
          ...imageProps,
          className: imageClasses,
        }}
      />
    );
  }

  const coverVariant = getCoverVariant(post, typographicCoverEnabled);
  const view = renderOverlay({
    overlay,
    image:
      post && (coverVariant === 'hook' || coverVariant === 'title') ? (
        <TypographicCover
          post={post}
          variant={coverVariant}
          className={imageClasses}
        />
      ) : (
        <CardImage
          {...imageProps}
          type={ImageType.Post}
          className={imageClasses}
        />
      ),
  });

  return <>{view}</>;
}
