import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../../../lib/image';
import { Card } from './Card';

type TextImageProps = {
  text: ReactElement;
  image: string;
  className: string;
};
export default function TextImage({
  text,
  image,
  className,
}: TextImageProps): ReactElement {
  return (
    <Card className={className} shadow={false} padding="p-3" height="">
      {text}
      <div
        className={classNames('rounded-16', 'aspect-square h-40')}
        style={{
          background: `url(${image}) center center / cover, url(${cloudinary.post.imageCoverPlaceholder}) center center / cover`,
        }}
      />
    </Card>
  );
}
