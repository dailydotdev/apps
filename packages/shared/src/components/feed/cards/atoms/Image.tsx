import React, { ImgHTMLAttributes, ReactElement } from 'react';
import classed from '../../../../lib/classed';
import { Image as DefaultImage } from '../../../image/Image';

const BaseImage = classed(DefaultImage, 'rounded-xl h-40 object-cover');
interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}
export const Image = ({ ...props }: ImageProps): ReactElement => (
  <BaseImage {...props} />
);
