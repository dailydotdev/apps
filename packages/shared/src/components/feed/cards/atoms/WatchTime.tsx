import React, { ReactElement } from 'react';
import { Post } from '../../../../graphql/posts';
import {
  Typography,
  TypographyElement,
  TypographyProps,
} from '../../../typography/Typography';
import { formatReadTime } from '../../../utilities';

type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'p'>;

export default function WatchTime<TagName extends AllowedTags>({
  readTime,
  ...props
}: Pick<Post, 'readTime'> & TypographyProps<TagName>): ReactElement {
  return (
    <Typography
      ref={props.ref}
      {...props}
      data-testid="readTime"
      element={TypographyElement.P}
    >
      {formatReadTime(readTime)} watch time
    </Typography>
  );
}
