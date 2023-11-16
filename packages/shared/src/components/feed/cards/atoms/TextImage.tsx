import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Typography } from './Typography';
import { cloudinary } from '../../../../lib/image';
import { Card } from './Card';

type TextImageProps = {
  text: typeof Typography;
  image: string;
};
export default function TextImage({
  text,
  image,
}: TextImageProps): ReactElement {
  return (
    <Card>
      {text}
      <div
        className={classNames('rounded-xl', 'h-20 aspect-square')}
        style={{
          background: `url(${image}) center center / cover, url(${cloudinary.post.imageCoverPlaceholder}) center center / cover`,
        }}
      />
    </Card>
  );
}
