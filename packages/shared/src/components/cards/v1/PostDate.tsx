import React, { ReactElement, useMemo } from 'react';
import { postDateFormat } from '../../../lib/dateFormat';

interface PostDateProps {
  createdAt: string;
}

export default function PostDate({ createdAt }: PostDateProps): ReactElement {
  const date = useMemo(
    () => createdAt && postDateFormat(createdAt),
    [createdAt],
  );

  return <time dateTime={createdAt}>{date}</time>;
}
