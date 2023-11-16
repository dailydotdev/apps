import React, { ReactElement, useMemo } from 'react';
import { postDateFormat } from '../../../../lib/dateFormat';
import { Post } from '../../../../graphql/posts';
import { Typography, TypographyElement, TypographyProps } from './Typography';

type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'time'>;

export default function CreatedAt<TagName extends AllowedTags>({
  createdAt,
  ...props
}: Pick<Post, 'createdAt'> & TypographyProps<TagName>): ReactElement {
  const date = useMemo(
    () => createdAt && postDateFormat(createdAt),
    [createdAt],
  );
  return (
    <Typography
      {...props}
      element={TypographyElement.TIME}
      dateTime={createdAt}
    >
      {date}
    </Typography>
  );
}
