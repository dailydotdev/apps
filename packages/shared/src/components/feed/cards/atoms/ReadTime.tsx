import React, { ReactElement } from 'react';
import { Post } from '../../../../graphql/posts';
import { Typography, TypographyElement, TypographyProps } from './Typography';

type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'p'>;

export default function ReadTime<TagName extends AllowedTags>({
  readTime,
  ...props
}: Pick<Post, 'readTime'> & TypographyProps<TagName>): ReactElement {
  return (
    <Typography {...props} data-testid="readTime" element={TypographyElement.P}>
      {readTime}m read time
    </Typography>
  );
}
