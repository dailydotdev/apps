import React, { ReactElement, RefAttributes, useMemo } from 'react';
import { postDateFormat } from '../../../../lib/dateFormat';
import { Post } from '../../../../graphql/posts';
import {
  Typography,
  TypographyElement,
  TypographyProps,
} from '../../../typography/Typography';

type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'time'>;

export default function CreatedAt<TagName extends AllowedTags>({
  createdAt,
  ...props
}: Pick<Post, 'createdAt'> &
  TypographyProps<TagName> &
  RefAttributes<HTMLElement>): ReactElement {
  const date = useMemo(
    () => createdAt && postDateFormat(createdAt),
    [createdAt],
  );
  return (
    <Typography
      {...props}
      ref={props.ref}
      element={TypographyElement.TIME}
      dateTime={createdAt}
    >
      {date}
    </Typography>
  );
}
